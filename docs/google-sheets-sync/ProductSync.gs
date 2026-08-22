/**
 * Jaai Google Sheet → website catalog synchronization.
 *
 * Required Script Properties:
 *   BACKEND_URL      e.g. https://jaee-backend.onrender.com
 *   SHEET_SYNC_SECRET (must equal GOOGLE_SHEETS_SYNC_SECRET on Render)
 * Optional:
 *   PRODUCT_SHEET_NAME (defaults to the first sheet)
 */
const HEADER_ROW = 4;
const FIRST_DATA_ROW = 5;
const LOG_SHEET_NAME = 'Catalog Sync Log';
const BATCH_SIZE = 50;
const MAX_RETRIES = 3;

const REQUIRED_HEADERS = [
  'SKU',
  'Product Name',
  'Size',
  'Fragrance',
  'Color',
  'Total Cost',
  'Website Pricing',
  'Stock Quantity',
];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Jaai Catalog')
    .addItem('Install edit trigger', 'installProductSyncTrigger')
    .addItem('Sync all products', 'syncAllProducts')
    .addSeparator()
    .addItem('Open sync log', 'openSyncLog')
    .addToUi();
}

/**
 * Run once from the Jaai Catalog menu. This installable trigger is required
 * because simple onEdit triggers cannot call UrlFetchApp.
 */
function installProductSyncTrigger() {
  assertConfigured_();
  const spreadsheet = SpreadsheetApp.getActive();
  ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === 'handleProductEdit')
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger));

  ScriptApp.newTrigger('handleProductEdit')
    .forSpreadsheet(spreadsheet)
    .onEdit()
    .create();

  spreadsheet.toast('Automatic product sync is enabled.', 'Jaai Catalog', 5);
}

/** Installable edit-trigger handler. Do not rename without reinstalling it. */
function handleProductEdit(event) {
  if (!event || !event.range) return;

  const sheet = event.range.getSheet();
  if (sheet.getName() !== getProductSheet_().getName()) return;

  const firstRow = Math.max(event.range.getRow(), FIRST_DATA_ROW);
  const lastRow = event.range.getLastRow();
  if (lastRow < FIRST_DATA_ROW) return;

  SpreadsheetApp.flush();
  Utilities.sleep(150);

  try {
    const rows = readRows_(sheet, firstRow, lastRow);
    if (rows.length === 0) return;
    const response = syncRows_(rows);
    writeLog_('Edit rows ' + firstRow + '-' + lastRow, response);
    showSummary_(response);
  } catch (error) {
    writeFailureLog_('Edit rows ' + firstRow + '-' + lastRow, error);
    throw error;
  }
}

/** Initial import and recovery action. Safe to run repeatedly (SKU-idempotent). */
function syncAllProducts() {
  assertConfigured_();
  const sheet = getProductSheet_();
  SpreadsheetApp.flush();

  const lastRow = sheet.getLastRow();
  if (lastRow < FIRST_DATA_ROW) {
    SpreadsheetApp.getActive().toast('No product rows found.', 'Jaai Catalog', 5);
    return;
  }

  const rows = readRows_(sheet, FIRST_DATA_ROW, lastRow);
  if (rows.length === 0) {
    SpreadsheetApp.getActive().toast('No rows with an SKU found.', 'Jaai Catalog', 5);
    return;
  }

  const combined = emptyResponse_();
  for (let start = 0; start < rows.length; start += BATCH_SIZE) {
    mergeResponse_(combined, syncRows_(rows.slice(start, start + BATCH_SIZE)));
  }

  writeLog_('Full sync (' + rows.length + ' rows)', combined);
  showSummary_(combined);
}

function openSyncLog() {
  const sheet = getOrCreateLogSheet_();
  SpreadsheetApp.setActiveSheet(sheet);
}

function readRows_(sheet, firstRow, lastRow) {
  const lastColumn = sheet.getLastColumn();
  const headers = sheet.getRange(HEADER_ROW, 1, 1, lastColumn).getDisplayValues()[0];
  const indexes = headerIndexes_(headers);

  const missing = REQUIRED_HEADERS.filter((header) => indexes[header] === undefined);
  if (missing.length > 0) {
    throw new Error('Missing required column(s): ' + missing.join(', '));
  }

  const count = lastRow - firstRow + 1;
  const rawValues = sheet.getRange(firstRow, 1, count, lastColumn).getValues();
  const displayValues = sheet.getRange(firstRow, 1, count, lastColumn).getDisplayValues();

  return rawValues.map((raw, offset) => {
    const display = displayValues[offset];
    const sku = text_(display[indexes['SKU']]);
    if (!sku) return null;

    return {
      rowNumber: firstRow + offset,
      sku: sku,
      productName: text_(display[indexes['Product Name']]),
      size: text_(display[indexes['Size']]),
      fragrance: text_(display[indexes['Fragrance']]),
      color: text_(display[indexes['Color']]),
      totalCost: number_(raw[indexes['Total Cost']]),
      websitePrice: number_(raw[indexes['Website Pricing']]),
      stockQuantity: integer_(raw[indexes['Stock Quantity']]),
    };
  }).filter(Boolean);
}

function syncRows_(rows) {
  assertConfigured_();
  const properties = PropertiesService.getScriptProperties();
  const backendUrl = properties.getProperty('BACKEND_URL').replace(/\/+$/, '');
  const secret = properties.getProperty('SHEET_SYNC_SECRET');
  const url = backendUrl + '/integrations/google-sheets/products/sync';

  let lastError = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        headers: { 'X-Sheet-Sync-Secret': secret },
        payload: JSON.stringify({ rows: rows }),
        muteHttpExceptions: true,
      });

      const status = response.getResponseCode();
      const body = response.getContentText();
      if (status >= 200 && status < 300) {
        const parsed = JSON.parse(body);
        return parsed.data;
      }
      if (status < 500 && status !== 429) {
        throw new Error('Sync rejected (' + status + '): ' + body);
      }
      lastError = new Error('Temporary backend error (' + status + '): ' + body);
    } catch (error) {
      lastError = error;
      if (String(error.message || error).indexOf('Sync rejected') === 0) throw error;
    }

    if (attempt < MAX_RETRIES) Utilities.sleep(attempt * 1000);
  }
  throw lastError || new Error('Product synchronization failed');
}

function getProductSheet_() {
  const spreadsheet = SpreadsheetApp.getActive();
  const configuredName = PropertiesService.getScriptProperties().getProperty('PRODUCT_SHEET_NAME');
  if (configuredName) {
    const configured = spreadsheet.getSheetByName(configuredName);
    if (!configured) throw new Error('Product sheet not found: ' + configuredName);
    return configured;
  }
  return spreadsheet.getSheets()[0];
}

function headerIndexes_(headers) {
  return headers.reduce((result, header, index) => {
    const normalized = text_(header);
    if (normalized) result[normalized] = index;
    return result;
  }, {});
}

function assertConfigured_() {
  const properties = PropertiesService.getScriptProperties();
  const missing = ['BACKEND_URL', 'SHEET_SYNC_SECRET']
    .filter((key) => !properties.getProperty(key));
  if (missing.length > 0) {
    throw new Error('Missing Apps Script property/properties: ' + missing.join(', '));
  }
}

function showSummary_(response) {
  const summary = [
    'Created ' + (response.created || 0),
    'updated ' + (response.updated || 0),
    'linked ' + (response.linked || 0),
    'skipped ' + (response.skipped || 0),
    'failed ' + (response.failed || 0),
  ].join(', ');
  SpreadsheetApp.getActive().toast(summary, 'Jaai Catalog Sync', 8);
}

function writeLog_(source, response) {
  const sheet = getOrCreateLogSheet_();
  const details = (response.results || [])
    .filter((result) => result.status === 'skipped' || result.status === 'failed')
    .map((result) => 'Row ' + result.rowNumber + ' [' + result.sku + ']: ' + result.message)
    .join('\n');
  sheet.appendRow([
    new Date(),
    source,
    response.created || 0,
    response.updated || 0,
    response.linked || 0,
    response.skipped || 0,
    response.failed || 0,
    details,
  ]);
}

function writeFailureLog_(source, error) {
  const sheet = getOrCreateLogSheet_();
  sheet.appendRow([new Date(), source, 0, 0, 0, 0, 1, String(error.message || error)]);
}

function getOrCreateLogSheet_() {
  const spreadsheet = SpreadsheetApp.getActive();
  let sheet = spreadsheet.getSheetByName(LOG_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(LOG_SHEET_NAME);
    sheet.appendRow([
      'Timestamp',
      'Source',
      'Created',
      'Updated',
      'Linked',
      'Skipped',
      'Failed',
      'Details',
    ]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function emptyResponse_() {
  return { created: 0, updated: 0, linked: 0, skipped: 0, failed: 0, results: [] };
}

function mergeResponse_(target, source) {
  ['created', 'updated', 'linked', 'skipped', 'failed'].forEach((key) => {
    target[key] += source[key] || 0;
  });
  target.results = target.results.concat(source.results || []);
}

function text_(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function number_(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const normalized = String(value === null || value === undefined ? '' : value)
    .replace(/[₹,%\s,]/g, '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function integer_(value) {
  const parsed = number_(value);
  return parsed === null ? null : Math.trunc(parsed);
}
