# Yến Sào — Branding Guide (Apiary-style)

> Mục tiêu: xây dựng nhận diện sang trọng, sạch, đáng tin; bám phong cách **Apiary-style storytelling** như template hereford (hero tối giản, mảng trắng lớn, ảnh tỷ lệ 1:1, nhấn sắc **Gold**). Ưu tiên **mobile-first** (iPhone).

---

## 1) Brand positioning & voice
**Định vị:** nhà sản xuất/gia công yến sào chuẩn – minh bạch COA, quy trình sạch, giá hợp lý cho khách lẻ.  
**Tính cách:** tin cậy, tinh tế, mộc mạc (ít khoa trương).  
**Giọng điệu:** gần gũi, súc tích, ưu tiên lợi ích thực (không thổi phồng), tránh thuật ngữ y khoa nặng nề.

**Tagline gợi ý:** *“Nguyên bản – Tinh khiết – Minh bạch.”*

---

## 2) Logo & khoảng cách an toàn
- **Logo wordmark** “YẾN SÀO” (uppercase, font heading).  
- **Clear space:** tối thiểu = chiều cao chữ “O”.  
- **Kích thước tối thiểu:** 24px chiều cao trên mobile.  
- **Nền ưu tiên:** **Ivory** hoặc **Trắng**, không đặt trên ảnh quá nhiễu.

---

## 3) Màu sắc (Palette)
| Token       | Hex     | Dùng cho |
|-------------|---------|---------|
| `--gold`    | `#C8A15A` | CTA chính, viền nhấn, icon |
| `--ivory`   | `#F8F5EF` | Nền chính (hero/background) |
| `--espresso`| `#4B3A2B` | Tiêu đề, text đậm, icon nâu |
| `--text`    | `#1D1D1F` | Nội dung văn bản |
| `--muted`   | `#8E8E93` | Màu phụ, mô tả, viền nhẹ |
| `--success` | `#8FBF6F` | Trạng thái/nhãn chất lượng |

**Nguyên tắc:** nền **Ivory**, chữ **Espresso/Text**; CTA **Gold**; viền mảnh **Muted/20%**. Hạn chế dùng quá 2 màu mạnh trong 1 khối.

---

## 4) Typography
- **Heading:** *Lora* 600–700 (serif), tracking -0.2px.  
- **Body:** *Be Vietnam Pro* 400–600, size 15–17px mobile; 16–18px desktop.  
- **Scale đề xuất (mobile → desktop):**
  - H1: 28 → 40/48
  - H2: 22 → 28/32
  - H3: 18 → 20/22
  - Body: 16/17
  - Caption: 12–13

---

## 5) Layout & Grid
- **Container:** 100% max `1536px`; mobile padding `16px`, tablet `24px`, desktop `32px`.
- **Grid sản phẩm:** 2 cột (mobile), 3 cột (≥768px). Gutter 16–24px.  
- **Card radius:** 16px; **Shadow:** `0 8px 24px rgba(0,0,0,.12)` (nhẹ).  
- **Khoảng cách dọc:** 8 / 12 / 16 / 24 / 32 / 48.

**Breakpoints:**  
`xs 360` · `sm 390/414` · `md 768` · `lg 1024` · `xl 1280+`.

---

## 6) Hình ảnh
- **Tỷ lệ:** 1:1 cho sản phẩm; 3:2/16:9 cho banner/hero phụ.  
- **Phong cách:** ánh sáng tự nhiên, phông nền be/ivory; đạo cụ gỗ, gốm, vải mộc.  
- **Xử lý:** giữ màu thật; hạn chế filter bão hoà.  
- **Alt text:** mô tả *loại yến + dung tích/khối lượng + bối cảnh*.

---

## 7) Buttons & States
- **Primary:** nền `--gold`, chữ trắng, radius 12–16px, cao 44–48px; hover: giảm opacity 90%.
- **Secondary:** viền `--gold` nền trong suốt, chữ **Espresso**; hover: nền `--gold/10`.
- **Ghost:** chữ Espresso, không viền; chỉ dùng trong nhóm CTA phụ.
- **Focus ring:** 2px outline `#0B5FFF` ở trạng thái focus-visible.

---

## 8) Iconography & Illustration
- Biểu tượng đơn nét, bo tròn nhỏ, màu **Espresso** hoặc **Gold**.  
- Tránh icon nhiều màu/phức tạp; nhất quán stroke 1.5–2px.

---

## 9) Tone & Copy
- Câu ngắn, lợi ích trước – chi tiết sau.  
- Đơn vị rõ ràng: “ml”, “g”, “hũ”.  
- Giá VND: **89.000₫** (dấu chấm ngàn).  
- Tránh tuyệt đối hóa: thay “tốt nhất” → “chuẩn mực”, “đúng kỹ thuật”.

---

## 10) Hệ thống token (CSS Custom Properties)
```css
:root{
  --ivory:#F8F5EF; --gold:#C8A15A; --espresso:#4B3A2B;
  --text:#1D1D1F; --muted:#8E8E93; --success:#8FBF6F;
  --radius:16px; --radius-sm:10px;
  --shadow-sm:0 2px 6px rgba(0,0,0,.08);
  --shadow:0 8px 24px rgba(0,0,0,.12);
}
```

---

## 11) Accessibility
- Contrast tối thiểu 4.5:1 cho body; 3:1 cho heading lớn.  
- Hit area ≥ 44×44px; khoảng cách bottom-nav đủ safe area (iPhone).  
- Thứ tự tiêu đề logic H1→H2→H3; biểu mẫu có label/aria.

---

## 12) GA4 & Analytics (tên sự kiện)
- `view_item_list`, `select_item`, `add_to_cart`, `view_coa`, `faq_open`.
- Thẻ UTM cho chiến dịch: `utm_source`, `utm_medium`, `utm_campaign`.

---

## 13) Tệp phông & bản quyền ảnh
- Dùng Google Fonts (Lora / Be Vietnam Pro).  
- Ảnh tự chụp hoặc có quyền sử dụng; lưu giữ COA/metadata ảnh gốc.
