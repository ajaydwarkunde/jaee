# Google Sheet Product Sync

This integration pushes product edits from the Jaai inventory spreadsheet to the
Spring backend. It does not poll Google, and it does not require the sheet to
remain public.

## Sheet columns

Headers must remain on row 4. Column order may change because the script resolves
values by header name.

| Sheet header | Website field |
|---|---|
| `SKU` | Stable product identity |
| `Product Name` | Product name |
| `Size` | Variant option `Size` |
| `Fragrance` | Variant option `Scent` |
| `Color` | Variant option `Color` |
| `Total Cost` | Internal base cost / variant expense |
| `Website Pricing` | Selling price |
| `Stock Quantity` | Product and variant inventory |

Add a new `Stock Quantity` column to the sheet before enabling the trigger.
Every synchronized row requires a non-empty SKU/name, positive total cost and
website price, and stock greater than or equal to zero.

## 1. Configure the backend

Generate a strong secret:

```bash
openssl rand -hex 32
```

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
  -d '{"rows":[{"rowNumber":5,"sku":"SYNC-TEST","productName":"Sync Test Draft","size":"Small","fragrance":"Rose","color":"Red","totalCost":10,"websitePrice":20,"stockQuantity":0}]}'
```

Expect HTTP 200 with `created: 1` on the first call and `updated: 1` on a
repeat. Delete the inactive `SYNC-TEST` draft from admin after verification.

## 2. Install the Apps Script

1. Open the Google Sheet.
2. Select **Extensions → Apps Script**.
3. Replace the editor contents with
   [`ProductSync.gs`](./ProductSync.gs), then save.
4. Open **Project Settings → Script Properties** and add:

| Property | Example |
|---|---|
| `BACKEND_URL` | `https://jaee-backend-staging.onrender.com` |
| `SHEET_SYNC_SECRET` | The matching Render secret |
| `PRODUCT_SHEET_NAME` | Optional; omit to use the first worksheet |

5. Reload the spreadsheet.
6. Select **Jaai Catalog → Install edit trigger** and approve the Google
   authorization prompts.

Do not put the secret in a sheet cell or commit it to this repository.

## 3. Initial synchronization

Test with a copy of the sheet and the staging backend first.

1. Select **Jaai Catalog → Sync all products**.
2. Review the toast summary.
3. Open **Jaai Catalog → Open sync log** for skipped or failed rows.
4. Complete newly created inactive drafts in website admin by adding category,
   description and images, then activate them.

The first full sync links a sheet row to an existing unlinked website product
only when there is exactly one case-insensitive product-name match. Ambiguous
matches are skipped. Unmatched SKUs create inactive drafts. Re-running the sync
is safe because all later updates use SKU.

## Ongoing behavior

- Manual edits and multi-row pastes trigger synchronization within seconds.
- Formula results are flushed before the edited rows are read.
- Website-only fields—images, description, categories, videos, customization
  and active status—are preserved for existing products.
- Sheet-owned fields are overwritten on every sync.
- Treat SKU as immutable after the first sync. Changing it creates/links a
  different product and leaves the old product untouched.
- Deleting a row does not delete or deactivate its website product.
- Transient `429` and `5xx` responses are retried up to three times.

## Disable or roll back

In Apps Script, open **Triggers** and delete the `handleProductEdit` trigger.
For immediate server-side revocation, rotate or remove
`GOOGLE_SHEETS_SYNC_SECRET` in Render.
