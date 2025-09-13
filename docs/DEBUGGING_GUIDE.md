# 🐛 Debugging Guide - Yến Sào Đăk Lăk

## Common Issues & Solutions

### 🚨 **Route Ordering Issues**

**Problem**: Routes return 404 even though they exist in code
**Cause**: Wildcard route `app.get("*")` placed before specific routes

#### ✅ **Correct Route Order** (in `src/worker.ts`):
```typescript
// 1. API Routes
app.get("/api/products", ...)
app.get("/api/categories", ...)
app.route("/api/admin", adminApp)

// 2. Specific Page Routes  
app.get("/", ...)                    // Homepage
app.get("/admin", ...)               // Admin UI
app.get("/admin/", ...)
app.get("/product/:slug", ...)       // Product detail pages

// 3. Media/Asset Routes
app.get("/media/*", ...)             // Image proxy

// 4. Wildcard (MUST BE LAST!)
app.get("*", async (c) => {          // Static assets catch-all
  return c.env.ASSETS.fetch(c.req.raw)
})

export default app
```

#### ❌ **Wrong Order** (causes 404s):
```typescript
// This catches ALL routes before specific ones can match!
app.get("*", async (c) => {
  return c.env.ASSETS.fetch(c.req.raw)
})

app.get("/product/:slug", ...)  // Never reached!
```

#### 🔧 **How to Fix**:
1. Find wildcard route in worker
2. Cut/move it to just before `export default app`
3. Ensure specific routes come first

---

### 🖼️ **Image URL Issues** 

**Problem**: Admin uploaded images return 404
**Cause**: URLs using old `/api/admin/proxy/` instead of `/media/`

#### ✅ **Solution**:
1. **Add media route** in worker:
```typescript
app.get("/media/*", async (c) => {
  if (!c.env.MEDIA) return c.notFound()
  const imagePath = c.req.path.replace("/media/", "")
  const obj = await c.env.MEDIA.get(imagePath)
  if (!obj) return c.notFound()
  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType || "image/webp",
      "Cache-Control": "public, max-age=31536000"
    }
  })
})
```

2. **Update admin.ts** to use new URLs:
```bash
sed -i 's|/api/admin/proxy/|/media/|g' src/admin.ts
```

3. **Add URL conversion** in product detail pages:
```typescript
function convertImageUrl(url) {
  if (!url) return url
  return url.replace(/^\/api\/admin\/proxy\/(.*)$/, (match, encodedPath) => {
    const decodedPath = decodeURIComponent(encodedPath)
    return `/media/${decodedPath}`
  })
}

if (product.images && Array.isArray(product.images)) {
  product.images = product.images.map(convertImageUrl)
}
```

---

### 🔄 **Cloudflare Cache Issues**

**Problem**: Changes not reflected on live site
**Cause**: Aggressive caching by Cloudflare Pages/Workers

#### ✅ **Solutions**:

1. **Add no-cache headers** for admin:
```typescript
app.get("/admin", async (c) => {
  const adminHtml = await c.env.ASSETS.fetch(...)
  return new Response(adminHtml.body, {
    headers: {
      ...Object.fromEntries(adminHtml.headers),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    }
  })
})
```

2. **Test with cache busting**:
```bash
curl "https://yensaodaklak.vn/admin/?v=$(date +%s)"
```

3. **Hard refresh** in browser: `Ctrl+Shift+R`

---

### 🏗️ **Build Errors**

**Problem**: TypeScript/syntax errors preventing deployment

#### Common Errors & Fixes:

1. **Regex syntax error**:
```typescript
// ❌ Wrong:
url.replace(/^/api/admin/proxy/(.*)$/, ...)

// ✅ Correct:  
url.replace(/^\/api\/admin\/proxy\/(.*)$/, ...)
```

2. **Extra closing braces**:
```typescript
// ❌ Wrong:
})
})  // Extra brace!

// ✅ Correct:
})
```

3. **HTML outside template strings**:
```typescript
// ❌ Wrong:
const html = `...`
</script>  // Outside template string!

// ✅ Correct:
const html = `...
</script>`
```

#### 🔧 **Prevention**:
- Always backup before major changes: `cp src/worker.ts src/worker.ts.backup-$(date +%H%M)`
- Use careful sed operations with proper escaping
- Test syntax before committing

---

### 📱 **Homepage Product Click Issues**

**Problem**: Clicking products on homepage doesn't navigate
**Cause**: Z-index/pointer-events conflicts

#### ✅ **Solution - Stretched Links**:
```html
<article class="relative isolate">
  <!-- Stretched link covers entire card -->
  <a href="/product/yen-chung-hu-70ml" 
     class="absolute inset-0 z-10" 
     aria-label="Product name"></a>
  
  <!-- All decorative elements have pointer-events: none -->
  <div class="pointer-events-none">Product info...</div>
  
  <!-- Buttons need higher z-index -->
  <button class="relative z-20">Add to cart</button>
</article>
```

#### Required CSS:
```css
.isolate { isolation: isolate; }
.pointer-events-none { pointer-events: none; }
.z-10 { z-index: 10; }
.z-20 { z-index: 20; }
```

---

### 🚀 **Deployment Checklist**

Before deploying changes:

#### ✅ **Pre-deployment**:
- [ ] Route order correct (wildcard last)
- [ ] No duplicate routes  
- [ ] Backup current working version
- [ ] Test locally if possible

#### ✅ **Post-deployment**:
- [ ] Test specific routes: `/product/yen-chung-hu-70ml`
- [ ] Test admin UI: `/admin/`
- [ ] Test image loading: `/media/products/...`
- [ ] Hard refresh to bypass cache

#### 🔧 **Quick Tests**:
```bash
# Test route responses
curl -I "https://yensaodaklak.vn/product/yen-chung-hu-70ml"
curl -I "https://yensaodaklak.vn/admin/"
curl -I "https://yensaodaklak.vn/media/products/test.webp"

# Check for expected status codes
# 200 OK = working
# 404 = route issue  
# 500 = server/syntax error
```

---

### 📝 **Development Workflow**

#### Safe approach for major changes:

1. **Backup first**:
```bash
cp src/worker.ts src/worker.ts.backup-$(date +%H%M)
```

2. **Make small incremental changes**
3. **Test each change**:
```bash
# Local syntax check
node -p "require('typescript').transpile(require('fs').readFileSync('src/worker.ts', 'utf8'))" > /dev/null
```

4. **Commit frequently**:
```bash
git add . && git commit -m "Small incremental change"
```

5. **Test after deployment**

#### Recovery from broken state:
```bash
# List available backups
ls -la src/*.backup*

# Restore from backup
cp src/worker.ts.backup-HHMM src/worker.ts

# Clean rebuild
git add . && git commit -m "Restore from backup" && git push
```

---

## 🎯 **Quick Reference**

### Route Order (Most Important!):
1. APIs (`/api/*`)
2. Specific pages (`/admin`, `/product/:slug`)  
3. Media proxies (`/media/*`)
4. **Wildcard LAST** (`*`)

### Image URLs:
- **New**: `/media/products/filename.webp`
- **Old**: `/api/admin/proxy/products%2Ffilename.webp`

### Cache Busting:
- Admin: Add no-cache headers
- Testing: `?v=$(date +%s)` 
- Browser: `Ctrl+Shift+R`

### Build Errors:
- Escape regex slashes: `\/`
- Check brace matching: `{` vs `}`
- Keep HTML in template strings: `` `...` ``

---

*Last updated: 2025-09-13*
*Project: Yến Sào Đăk Lăk*
