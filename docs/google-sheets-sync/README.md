# Google Sheet Product Sync

This integration pushes product edits from the Jaai inventory spreadsheet to the
Spring backend. It does not poll Google, and it does not require the sheet to
remain public.

## Sheet columns

Headers must remain on row 4. Column order may change because the script resolves
values by header name.

| Sheet header | Website field |
|---|---|
| `SKU` | Stable identity for one product variant; every row must have a unique SKU |
| `Product Name` | Product grouping key. Rows with the same name appear as variants on one product page |
| `Description` | Optional storefront description. A non-empty value updates the website; blank preserves the description entered in admin. |
| `Size` | Variant option `Size` |
| `Fragrance` | Variant option `Scent` |
| `Color` | Variant option `Color` |
| `Total Cost` | Internal base cost (optional; never shown to customers) |
| `Website Pricing` | Selling price. Blank means “Contact us for pricing” |
| `Stock Quantity` | Inventory. Optional; defaults to 0. Aliases also accepted: `Quantity`, `Stock Qty`, `Stock`, `Qty`. Blank syncs as 0 (shows Out of Stock). |
| `Active` | `Yes` publishes the row; `No` keeps the SKU synced but hidden on the shop. Blank defaults to `Yes` |
| `Category` | Optional. One or more category names, separated by comma (e.g. `Candle, Gift Hamper`). Matches existing categories by name/slug (or creates them). Blank preserves admin categories. Aliases: `Categories`. |
| `Image URLs` | Optional. Public `https://` image URLs, one per line (max 10). First URL is the primary image. Leave blank to keep admin uploads. |

Rows with an SKU and product name can sync even when cost, website price, or stock is blank.

## 1. Configure the backend

Do **not** run `openssl` if you prefer not to. In the sheet, open **Jaai Catalog → Generate sync secret**. Copy the value into Render as `GOOGLE_SHEETS_SYNC_SECRET`, then redeploy.

If you do generate a secret locally, `openssl rand -hex 32` only creates random bytes on your machine. It does not send data anywhere.

In Render, add `GOOGLE_SHEETS_SYNC_SECRET` with that value to the target backend
service, then redeploy it. Use separate secrets for staging and production.

The webhook endpoint is:

```text
POST {BACKEND_URL}/integrations/google-sheets/products/sync
X-Sheet-Sync-Secret: {secret}
```

After deployment, verify authentication and row mapping before installing the
trigger:

```bash
curl -X POST "$BACKEND_URL/integrations/google-sheets/products/sync" \
  -H "Content-Type: application/json" \
  -H "X-Sheet-Sync-Secret: $GOOGLE_SHEETS_SYNC_SECRET" \
  -d '{"rows":[{"rowNumber":5,"sku":"SYNC-TEST","productName":"Sync Test Product","size":"Small","fragrance":"Rose","color":"Red","totalCost":10,"websitePrice":20,"stockQuantity":0}]}'
```

Expect HTTP 200 with `created: 1` on the first call and `updated: 1` on a
repeat. Delete the active `SYNC-TEST` product from admin after verification.

## 2. Install the Apps Script

1. Open the Google Sheet.
2. Select **Extensions → Apps Script**.
3. Replace the editor contents with
   [`ProductSync.gs`](./ProductSync.gs), then save.
4. Open **Project Settings → Script Properties** and add:

| Property | Example |
|---|---|
| `BACKEND_URL` | Staging API, e.g. `https://jaee.onrender.com` |
| `BACKEND_URL_PRODUCTION` | Production API, e.g. `https://jaee-backend.onrender.com` |
| `SHEET_SYNC_SECRET` | Staging Render secret (from **Generate sync secret**) |
| `SHEET_SYNC_SECRET_PRODUCTION` | Optional. Production Render secret; omit to reuse `SHEET_SYNC_SECRET` |
| `PRODUCT_SHEET_NAME` | Optional; omit to use the first worksheet |

5. Reload the spreadsheet.
6. Select **Jaai Catalog → Install edit trigger** and approve the Google
   authorization prompts.

Do not put the secret in a sheet cell or commit it to this repository.

## 3. Initial synchronization

Test with a copy of the sheet and the staging backend first.

Cell edits and **Jaai Catalog → Sync all products (staging)** always go to `BACKEND_URL`. Production is never updated automatically. To update the live catalog, choose **Jaai Catalog → Sync all products (production)** and confirm the warning. That call uses `BACKEND_URL_PRODUCTION`.

1. Select **Jaai Catalog → Sync all products (staging)**.
2. Review the toast summary.
3. Open **Jaai Catalog → Open sync log** for skipped or failed rows.
4. Sheet products are published automatically. Add a description
   (if absent from the sheet), images, and categories via the sheet `Category`
   column (or in admin if that cell is blank).

The first row for a new Product Name creates and publishes a product. Other
rows with the same case-insensitive Product Name add or update variants under
that product. Each row's Size, Fragrance, Color, price, cost and stock belong to
its SKU. Product stock is the sum of its variants and the listing price is the
lowest sellable variant price. Re-running the sync is safe because later variant
updates use SKU.

### Example: one product, two variants

| SKU | Product Name | Size | Fragrance | Color | Website Pricing | Stock Quantity |
|---|---|---|---|---|---|---|
| `VT-A` | `Variant Group Candle` | `Small` | `Rose` | `Red` | `199` | `3` |
| `VT-B` | `Variant Group Candle` | `Large` | `Jasmine` | `White` | `299` | `5` |

After **Sync all products**, the storefront has **one** product page for
`Variant Group Candle` with Size / Scent / Color selectors for both SKUs.
Product Name must match exactly (case does not matter). Each row needs its own
SKU. If those SKUs were previously synced as separate products, re-sync folds
them into one product by name.

## Ongoing behavior

- Manual edits and multi-row pastes trigger synchronization within seconds.
- Formula results are flushed before the edited rows are read.
- Description and images use non-destructive optional ownership: a non-empty
  sheet cell updates the website, while a blank cell preserves the admin value.
- Website-only fields—videos and customization—are preserved. Categories are
  owned by the sheet when the Category column is filled; blank cells keep the
  admin category assignment.
- A full staging or production sync makes the sheet the published catalog:
  products represented by sheet SKUs are kept active, while products and variants
  absent from the sheet are deleted. A normal edit-trigger sync publishes the
  edited sheet product and deletes any legacy non-sheet products still in the
  database; run an explicit full sync to retire sheet rows removed from the sheet.
- Legacy seed/admin products were removed in migration `V50`. The storefront and
  admin catalog only list products with a `sheet_sku` set by the sync.
- Sheet-owned fields are overwritten on every sync.
- Treat SKU as immutable after the first sync. Changing it creates/links a
  different variant and leaves the old variant untouched.
- When renaming a product, update the Product Name on all of its variant rows
  together so they continue to share one product page.
- Deleting a row takes effect after the next explicit **Sync all products** run;
  the missing variant is deactivated, and its product is deleted when no sheet
  variants remain in the catalog.
- Transient `429` and `5xx` responses are retried up to three times.

## Disable or roll back

In Apps Script, open **Triggers** and delete the `handleProductEdit` trigger.
For immediate server-side revocation, rotate or remove
`GOOGLE_SHEETS_SYNC_SECRET` in Render.
