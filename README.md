# Yến Sào – Apiary-style on Cloudflare Workers (Starter)

## Admin (Hono + D1)
- Tạo DB:
  ```bash
  wrangler d1 create yensao
  # update wrangler.jsonc -> d1_databases[0].database_id
  npm run db:apply
  ```
- Đặt biến môi trường (optional):
  ```bash
  wrangler secret put ADMIN_USER
  wrangler secret put ADMIN_PASS
  ```
- Mở `/admin` để thêm FAQ & sản phẩm (form demo). API dùng Basic Auth.

## GA4
- Thay `G-XXXXXXX` trong `public/ga.js` bằng Measurement ID của bạn.
- Sẵn event `view_item_list`, `select_item`, `add_to_cart`, `view_coa`, `faq_open`.
