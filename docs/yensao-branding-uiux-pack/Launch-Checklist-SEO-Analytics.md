# Yến Sào — Launch Checklist + SEO & Analytics Plan (Apiary-style)

## 1) Hạ tầng & Build
- Cloudflare Workers (assets: `/public`, entry: `src/worker.ts`), Node >= 20.
- CI build:
  - Install: `npm install`
  - Build: `npm run build` (Tailwind -> `public/styles.css`)
  - Deploy: `npm run deploy` (hoặc platform tự deploy sau build)
- GA4: Thay Measurement ID `G-XXXXXXX` trong `public/ga.js` (nếu dùng).

## 2) Nội dung & Ảnh
- Hero: 1 ảnh 1:1 (packshot) 1000×1000 (webp/avif), < 120KB.
- Card SP (6 chiếc): 600–800px 1:1; alt ảnh = “loại + biến thể + dung tích/khối lượng”.
- Tông màu & props: gỗ, gốm, nền ivory; ánh sáng tự nhiên, không bão hoà.
- Copy: H1 ≤ 10 từ; subcopy ≤ 140 ký tự; CTA “Khám phá”, “Xem COA”.

## 3) SEO
- Title: “Yến sào chuẩn tinh hoa – nguyên bản, tinh khiết, minh bạch | Tên thương hiệu” (≤ 60 ký tự).
- Meta description: 130–155 ký tự; có “yến chưng hũ / yến thô / yến tinh sạch”, “COA”.
- Open Graph: og:title/description/image (1200×630).
- Sitemap (nếu nhiều trang), robots.txt cho phép crawl.
- Schema.org `Organization` + `Product` cho card (bổ sung sau khi có SKU).

## 4) Hiệu năng
- First load ≤ 200KB gzip (không tính font). Trì hoãn script không cần thiết.
- Ảnh dùng `loading="lazy"` (trừ ảnh hero nếu LCP), `width/height` cố định để tránh CLS.
- Font: display=swap, preload nếu cần (1–2 weights).
- Kiểm tra Lighthouse ≥ 90 cho Performance/Best Practices/SEO.

## 5) Khả năng truy cập (A11y)
- Độ tương phản: ≥ 4.5:1 cho body; ≥ 3:1 cho heading lớn.
- Tap target ≥ 44×44; bottom-nav tránh safe area iPhone.
- Semantics: H1→H2→H3; mọi input có label/aria.

## 6) GA4 Event Mapping
- `view_item_list` (khi render lưới 6 SP) — params: `item_list_id`, `items`[].
- `select_item` (click tiêu đề card) — params: `item_id`, `item_name`.
- `add_to_cart` (nút Thêm) — params: `currency`, `value`, `items`[].
- `view_coa` (submit tra cứu) — params: `lot_code`.
- `faq_open` (mở FAQ) — params: `question`.

## 7) QA trước khi lên
- Check responsive: 390×844, 414×896, 428×926, 768, 1024, 1280+.
- Kiểm tra link chết; favicon; 404 fallback.
- Kiểm tra hiển thị giá VND; định dạng dấu chấm ngàn.
- Test tốc độ thật bằng 4G (~1.6Mbps) trong DevTools.

## 8) Roadmap đề xuất (tuỳ ngân sách)
1. Trang `/process` + tra cứu COA (form + kết quả).
2. `/faq` + Admin nhẹ (Workers + D1) để CRUD.
3. Trang `/category` + lọc (giá, dung tích).
4. Schema Product + rich results (giá, rating).
5. Landing Ads: UTM + hero A/B test.
