/**
 * Jaai Google Sheet → website catalog synchronization.
 *
 * Required Script Properties:
 *   BACKEND_URL               staging API, e.g. https://jaee.onrender.com
 *   SHEET_SYNC_SECRET         must equal GOOGLE_SHEETS_SYNC_SECRET on staging Render
 * Optional:
 *   BACKEND_URL_PRODUCTION    production API, e.g. https://jaee-backend.onrender.com
 *   SHEET_SYNC_SECRET_PRODUCTION  production Render secret; falls back to SHEET_SYNC_SECRET
 *   PRODUCT_SHEET_NAME        defaults to the first sheet
 *
 * Cell edits and "Sync all products" always hit staging. Production is menu-only.
 */
const HEADER_ROW = 4;
const FIRST_DATA_ROW = 5;
const LOG_SHEET_NAME = 'Catalog Sync Log';
const BATCH_SIZE = 50;
const MAX_RETRIES = 3;

const REQUIRED_HEADERS = [
  'SKU',
  'Product Name',
];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Jaai Catalog')
    .addItem('Install edit trigger', 'installProductSyncTrigger')
    .addItem('Sync all products (staging)', 'syncAllProducts')
    .addItem('Sync all products (production)', 'syncAllProductsToProduction')
    .addSeparator()
    .addItem('Generate sync secret', 'generateSyncSecret')
    .addItem('Open sync log', 'openSyncLog')
    .addToUi();
}

/**
 * Run once from the Jaai Catalog menu. This installable trigger is required
 * because simple onEdit triggers cannot call UrlFetchApp.
 */
function installProductSyncTrigger() {
  assertConfigured_('staging');
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
    const response = syncRows_(rows, 'staging');
    writeLog_('Edit rows staging ' + firstRow + '-' + lastRow, response);
    showSummary_(response);
  } catch (error) {
    writeFailureLog_('Edit rows staging ' + firstRow + '-' + lastRow, error);
    throw error;
  }
}

/** Initial import and recovery action. Safe to run repeatedly (SKU-idempotent). */
function syncAllProducts() {
  syncAllProductsTo_('staging');
}

function syncAllProductsToProduction() {
  const ui = SpreadsheetApp.getUi();
  const confirmed = ui.alert(
    'This will update the live production catalog from this sheet. Continue?',
    ui.ButtonSet.YES_NO
  );
  if (confirmed !== ui.Button.YES) return;
  syncAllProductsTo_('production');
}

function syncAllProductsTo_(target) {
  assertConfigured_(target);
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
    const end = Math.min(start + BATCH_SIZE, rows.length);
    const isFinalBatch = end === rows.length;
    mergeResponse_(
      combined,
      syncRows_(
        rows.slice(start, end),
        target,
        isFinalBatch ? rows.map((row) => row.sku) : null
      )
    );
  }

  writeLog_('Full sync ' + target + ' (' + rows.length + ' rows)', combined);
  showSummary_(combined);
}

function openSyncLog() {
  const sheet = getOrCreateLogSheet_();
  SpreadsheetApp.setActiveSheet(sheet);
}

function generateSyncSecret() {
  const properties = PropertiesService.getScriptProperties();
  const existing = properties.getProperty('SHEET_SYNC_SECRET');
  const ui = SpreadsheetApp.getUi();
  if (existing) {
    const replace = ui.alert(
      'A sync secret already exists. Generate a new one? The old one will stop working until you update Render.',
      ui.ButtonSet.YES_NO
    );
    if (replace !== ui.Button.YES) return;
  }

  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    Utilities.getUuid() + new Date().toISOString() + Math.random()
  );
  const secret = toHex_(bytes);
  properties.setProperty('SHEET_SYNC_SECRET', secret);

  ui.alert(
    'Copy this value into Render as GOOGLE_SHEETS_SYNC_SECRET, then save and redeploy.\n\n' + secret
  );
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
      description: text_(cell_(display, indexes['Description'])),
      size: text_(cell_(display, indexes['Size'])),
      fragrance: text_(cell_(display, indexes['Fragrance'])),
      color: text_(cell_(display, indexes['Color'])),
      totalCost: number_(cell_(raw, headerIndex_(indexes, 'Total Cost', 'Cost'))),
      websitePrice: number_(cell_(raw, headerIndex_(indexes, 'Website Pricing', 'Website Price', 'Price'))),
      // Accept common aliases — a header named only "Quantity" used to sync as stock 0.
      stockQuantity: integer_(cell_(raw, headerIndex_(
        indexes,
        'Stock Quantity',
        'Quantity',
        'Stock Qty',
        'Stock',
        'Qty'
      ))),
      active: yesNo_(cell_(display, headerIndex_(indexes, 'Active'))),
      categories: categories_(cell_(display, headerIndex_(indexes, 'Category', 'Categories'))),
      imageUrls: imageUrls_(cell_(display, headerIndex_(indexes, 'Image URLs', 'Images', 'Image URL'))),
    };
  }).filter(Boolean);
}

function syncRows_(rows, target, catalogSkus) {
  assertConfigured_(target);
  const backendUrl = backendUrlFor_(target);
  const secret = secretFor_(target);
  const url = backendUrl + '/integrations/google-sheets/products/sync';

  let lastError = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        headers: { 'X-Sheet-Sync-Secret': secret },
        payload: JSON.stringify({
          rows: rows,
          // Present only on the final batch of an explicit full sync. The backend
          // then publishes this sheet catalog and retires products absent from it.
          catalogSkus: catalogSkus || null,
        }),
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

/** First matching header, case-insensitive. */
function headerIndex_(indexes, ...names) {
  for (let i = 0; i < names.length; i++) {
    if (indexes[names[i]] !== undefined) return indexes[names[i]];
  }
  const keys = Object.keys(indexes);
  for (let i = 0; i < names.length; i++) {
    const wanted = String(names[i]).toLowerCase();
    for (let k = 0; k < keys.length; k++) {
      if (keys[k].toLowerCase() === wanted) return indexes[keys[k]];
    }
  }
  return undefined;
}

function backendUrlFor_(target) {
  const properties = PropertiesService.getScriptProperties();
  const key = target === 'production' ? 'BACKEND_URL_PRODUCTION' : 'BACKEND_URL';
  return String(properties.getProperty(key) || '').replace(/\/+$/, '');
}

function secretFor_(target) {
  const properties = PropertiesService.getScriptProperties();
  if (target === 'production') {
    return properties.getProperty('SHEET_SYNC_SECRET_PRODUCTION')
      || properties.getProperty('SHEET_SYNC_SECRET');
  }
  return properties.getProperty('SHEET_SYNC_SECRET');
}

function assertConfigured_(target) {
  const missing = [];
  if (target === 'production') {
    if (!backendUrlFor_('production')) missing.push('BACKEND_URL_PRODUCTION');
    if (!secretFor_('production')) missing.push('SHEET_SYNC_SECRET or SHEET_SYNC_SECRET_PRODUCTION');
  } else {
    if (!backendUrlFor_('staging')) missing.push('BACKEND_URL');
    if (!secretFor_('staging')) missing.push('SHEET_SYNC_SECRET');
  }
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

function toHex_(bytes) {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    let value = bytes[i];
    if (value < 0) value += 256;
    const part = value.toString(16);
    hex += part.length === 1 ? '0' + part : part;
  }
  return hex;
}

function cell_(row, index) {
  return index === undefined ? '' : row[index];
}

function imageUrls_(value) {
  const text = text_(value);
  if (!text) return [];
  return text
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter((item) => item.indexOf('http://') === 0 || item.indexOf('https://') === 0)
    .slice(0, 10);
}

/** Category / Categories column: comma, semicolon, pipe or newline separated. */
function categories_(value) {
  const text = text_(value);
  if (!text) return [];
  const seen = {};
  const result = [];
  text.split(/[,;|/\n]+/).forEach((item) => {
    const name = String(item || '').trim().replace(/\s+/g, ' ');
    if (!name) return;
    const key = name.toLowerCase();
    if (seen[key]) return;
    seen[key] = true;
    result.push(name);
  });
  return result;
}

function text_(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function number_(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const normalized = String(value === null || value === undefined ? '' : value)
    .replace(/[₹,%\s,]/g, '')
    .trim();
  if (!normalized) return null;
  // Prefer a clean number; fall back to the first numeric token ("10 pcs" → 10).
  const parsed = Number(normalized);
  if (Number.isFinite(parsed)) return parsed;
  const match = normalized.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const fromToken = Number(match[0]);
  return Number.isFinite(fromToken) ? fromToken : null;
}

function integer_(value) {
  const parsed = number_(value);
  return parsed === null ? null : Math.trunc(parsed);
}

/** Sheet Active column: Yes (default) or No. Blank means Yes. */
function yesNo_(value) {
  const text = text_(value).toLowerCase();
  if (!text) return true;
  if (text === 'no' || text === 'n' || text === 'false' || text === '0') return false;
  return true;
}
