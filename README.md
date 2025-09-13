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
