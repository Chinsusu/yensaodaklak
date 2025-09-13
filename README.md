# Yến Sào – Cloudflare Workers (fixed v2)

## Chạy local
```bash
npm install
npm run build      # build Tailwind -> public/styles.css
npm run dev        # wrangler dev
npm run deploy
```

## Cloudflare Build (Pages/Workers CI)
- **Install command**: đặt `npm install` (đừng dùng `npm ci`).
- **Build command**: `npm run build`
- **Output dir**: (không cần, Worker tự serve /public qua ASSETS)
- Nếu build cũ fail, **Clear build cache** rồi Redeploy.

> Repo KHÔNG kèm `package-lock.json` để tránh xung đột khoá. Nếu muốn dùng `npm ci`, hãy chạy `npm install` local để sinh lock và commit.


<!-- DOCS_TOC:START -->
## Mục lục
- yensao-branding-uiux-pack
  - [Branding-Guide.md](docs/yensao-branding-uiux-pack/Branding-Guide.md)
  - [Branding-Guide.pdf](docs/yensao-branding-uiux-pack/Branding-Guide.pdf)
  - [Content-Guidelines.md](docs/yensao-branding-uiux-pack/Content-Guidelines.md)
  - [Content-Guidelines.pdf](docs/yensao-branding-uiux-pack/Content-Guidelines.pdf)
  - [Launch-Checklist-SEO-Analytics.md](docs/yensao-branding-uiux-pack/Launch-Checklist-SEO-Analytics.md)
  - [Launch-Checklist-SEO-Analytics.pdf](docs/yensao-branding-uiux-pack/Launch-Checklist-SEO-Analytics.pdf)
  - [UIUX-Layout-Spec.md](docs/yensao-branding-uiux-pack/UIUX-Layout-Spec.md)
  - [UIUX-Layout-Spec.pdf](docs/yensao-branding-uiux-pack/UIUX-Layout-Spec.pdf)
  - [Wireframes.pdf](docs/yensao-branding-uiux-pack/Wireframes.pdf)
- yensao-docs-apiary-style
  - [Branding-Guide.md](docs/yensao-docs-apiary-style/Branding-Guide.md)
  - [Content-Guidelines.md](docs/yensao-docs-apiary-style/Content-Guidelines.md)
  - [UIUX-Layout-Spec.md](docs/yensao-docs-apiary-style/UIUX-Layout-Spec.md)
- yensao-workers-site-v4.1r2
  - [README.md](docs/yensao-workers-site-v4.1r2/README.md)
<!-- DOCS_TOC:END -->
