# Yến Sào — UI/UX Layout Spec (Apiary-style Home)

> Cấu trúc trang chủ “Apiary-style storytelling + lưới 6 sản phẩm”, ưu tiên **mobile-first**.

---

## 0) Navigation (mobile-first)
- **Top bar**: trái search 🔎 (button), giữa logo wordmark, phải cart 🛒 (badge). Cao 44–56px, sticky, nền `Ivory` 90% + blur.
- **Bottom nav (mobile)**: 5 mục (Home, Danh mục, Tìm kiếm, Giỏ, Tài khoản), cao 56px, border-top `Muted/20%`.

---

## 1) Hero (Above the fold)
- **Grid 2 cột** (trên md), mobile xếp dọc.  
- **Left:** H1 28–40px; subcopy 16/17px; 2 CTA (Primary Gold + Secondary Outline).  
- **Right:** khối ảnh **1:1** (placeholder cho packshot).  
- **Spacing:** top/bottom 40–64px mobile; 80–120px desktop.

**CTA chính:** “Khám phá” → scroll `#best`. **CTA phụ:** “Xem COA” → `/process`.

---

## 2) Feature trio
- 3 thẻ đều nhau (grid 1×3), icon/emoji + H3 + mô tả ngắn.  
- Card nền **white**, radius 16px, shadow nhẹ. Hover translateY(-2px).

---

## 3) Bestseller — Lưới 6 SP
- **Grid:** 2 cột mobile, 3 cột ≥768px.  
- **Card:**
  - Hình 1:1, radius 16px.
  - Tên sản phẩm (2 dòng), mô tả ngắn (biến thể).
  - Giá **đậm**; nút “Thêm” (Primary).  
- **Khoảng cách:** padding card 12–16px; gap 16–24px.
- **Hành vi:** bấm tên → `select_item`; bấm Thêm → `add_to_cart`.

---

## 4) Story / Process teaser
- Khối dẫn về `/process`: ảnh minh hoạ + 3 bullet “Nguồn gốc – An toàn – Dinh dưỡng”.  
- Button “Tra cứu COA”.

---

## 5) Testimonials (tùy chọn)
- 3–6 lời nhận xét; rating (★ 4–5), avatar tròn 40–48px.  
- Nền **Ivory**, card **white**.

---

## 6) FAQ teaser
- 3–5 câu hay gặp, `details/summary` mở rộng. Link xem tất cả `/faq`.

---

## 7) Footer
- Link nhanh: Quy trình, COA, Chính sách, Liên hệ.  
- Mạng xã hội (biểu tượng đơn sắc). Copyright nhỏ.

---

## Components spec (tóm tắt)
- **Button (Primary):** H44/48, radius 12/16, padding x 16–20, font 15–16, bg `Gold`, color `#fff`, hover opacity 0.9.
- **Input:** H44, radius 12, border `Muted/30%`, focus ring 2px xanh (#0B5FFF). Placeholder màu `Muted`.
- **Badge (cart):** dot/number, 14px, nền Gold, text white.
- **Card:** radius 16, shadow, bg white; title leading-tight 1.2–1.3.

---

## Breakpoints & container
- `md: 768px` → chuyển 2 cột hero & 3 cột sản phẩm.  
- Max container: 1280–1536px; padding: 16 (mobile), 24 (tablet), 32 (desktop).

---

## iPhone details
- **Tap target ≥44px**; bottom-nav tránh **safe area** (iPhone X+).  
- Font body 16/17px để tránh zoom form tự động trên iOS.  
- Kiểm tra Snap points: 390×844, 414×896, 428×926.

---

## Analytics & events
- `view_item_list` on load bestseller grid.
- `select_item` on product title click.
- `add_to_cart` on CTA.
- `view_coa` khi submit form tra cứu.

---

## Performance budget
- Trang chủ ≤ 200KB gzip lần đầu (không tính font), trì hoãn script không cần thiết.  
- Ảnh webp/avif, kích thước 600–800px cho lưới 1:1.

---

## SEO cơ bản
- Title 55–60 ký tự, meta description 120–155.  
- Schema.org `Product` cho card (JSON-LD) (tuỳ bước sau).  
- Alt ảnh có từ khoá tự nhiên (không nhồi).
