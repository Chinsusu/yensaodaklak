import { Hono } from "hono"
import { cors } from "hono/cors"
import { adminApp } from "./admin"

export interface Env {
  ASSETS: Fetcher
  DB: D1Database
  YENSAO_KV?: KVNamespace
  MEDIA?: R2Bucket
  SESSION_SECRET?: string
  ADMIN_PASSWORD?: string
}

const app = new Hono<{ Bindings: Env }>()

// Enable CORS for API routes
app.use("/api/*", cors())

// Public API routes
app.get("/api/products", async (c) => {
  if (!c.env.YENSAO_KV) return c.json({ products: [] })
  const products = await c.env.YENSAO_KV.get("prods")
  if (!products) return c.json({ products: [] })
  const data = JSON.parse(products)
  return c.json({ products: data.filter(p => p.status === "active") })
})

app.get("/api/categories", async (c) => {
  if (!c.env.YENSAO_KV) return c.json({ categories: [] })
  const categories = await c.env.YENSAO_KV.get("cats")
  if (!categories) return c.json({ categories: [] })
  return c.json({ categories: JSON.parse(categories) })
})

// Admin API routes
app.route("/api/admin", adminApp)

// Enhanced homepage with product navigation
app.get("/", async (c) => {
  // Get original homepage
  const originalResponse = await c.env.ASSETS.fetch(new Request(new URL("/index.html", c.req.url).toString()))
  let html = await originalResponse.text()
  
  // Inject product navigation script before closing </body> tag
  const scriptToInject = `
    <script>
    (function(){
      function normalize(s){
        return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
      }
      const map = new Map([
        ['yen chung hu 70 ml','yen-chung-hu-70ml'],
        ['yen chung hu 70ml','yen-chung-hu-70ml'],
        ['yen chung hu 70','yen-chung-hu-70ml'],
        ['yen chung hu 100 ml','yen-chung-hu-100ml'],
        ['yen chung hu 100ml','yen-chung-hu-100ml'],
        ['yen chung hu 100','yen-chung-hu-100ml'],
        ['yen tinh sach 50 g','yen-tinh-sach-50g'],
        ['yen tinh sach 50g','yen-tinh-sach-50g'],
        ['yen tho 100 g','yen-tho-100g'],
        ['yen tho 100g','yen-tho-100g'],
        ['combo qua tang','combo-qua-tang'],
        ['set dung thu','set-dung-thu']
      ]);
      function guessSlugFromText(text){
        const t = normalize(text);
        for(const [k,v] of map){ if(t.includes(k)) return v; }
        return null;
      }
      function findContainer(el, max=6){
        let e=el, d=0; while(e && d<max){ if(e.matches && (e.matches('.product-card, article, .card, .grid > div') || e.getAttribute('onclick'))) return e; e=e.parentElement; d++; } return el;
      }
      document.addEventListener('click', function(ev){
        const target = ev.target; if(!(target instanceof Element)) return;
        const txtNorm = normalize(target.textContent||'');
        if(txtNorm==='them' || txtNorm==='them vao gio') return; // ignore cart buttons
        const nearText = (target.closest('[onclick]')?.textContent || '') + ' ' + (findContainer(target).innerText || '');
        const slug = guessSlugFromText(nearText);
        if(!slug) return;
        ev.preventDefault(); ev.stopPropagation();
        try{ if(typeof gtag!=='undefined'){ gtag('event','select_item',{ item_list_id:'homepage_products', items:[{ item_id: slug }] }); } }catch(e){}
        window.location.href = '/product/' + slug;
      }, true);
      console.log('[yensao] click enhancer active');
    })();
    </script>
`
  
  return c.html(html)
})

// Handle admin UI specifically
app.get("/admin", async (c) => {
  const adminHtml = await c.env.ASSETS.fetch(new Request(new URL("/admin/index.html", c.req.url).toString()))
  const response = new Response(adminHtml.body, {
    headers: {
      ...Object.fromEntries(adminHtml.headers),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    }
  })
  return response
})
})

// Product detail page route
app.get("/product/:slug", async (c) => {
  const slug = c.req.param("slug")
  
  // Try to get product from KV storage
  let product = null
  if (c.env.YENSAO_KV) {
    const products = await c.env.YENSAO_KV.get("prods")
    if (products) {
      const data = JSON.parse(products)
      product = data.find(p => p.slug === slug && p.status === "active")
    }
  }
  
  // Fallback to static product data
  const staticProducts = {
    "yen-chung-hu-70ml": { name: "Yến chưng hũ 70ml", price: 89000, desc: "Dung tích: 70 ml" },
    "yen-chung-hu-100ml": { name: "Yến chưng hũ 100ml", price: 109000, desc: "Dung tích: 100 ml" },
    "yen-tinh-sach-50g": { name: "Yến tinh sạch 50g", price: 1290000, desc: "Khối lượng: 50 g" },
    "yen-tho-100g": { name: "Yến thô 100g", price: 2350000, desc: "Khối lượng: 100 g" },
    "combo-qua-tang": { name: "Combo quà tặng", price: 1990000, desc: "Yến chưng + yến tinh" },
    "set-dung-thu": { name: "Set dùng thử", price: 249000, desc: "3 hũ x 70 ml" }
  }
  
  if (!product && staticProducts[slug]) {
    product = { 
      slug, 
      ...staticProducts[slug],
      images: [],
      long_desc: staticProducts[slug].desc
    }
  }
  
  if (!product) {
    return c.redirect("/")
  }
  
  // Convert old proxy URLs to new media URLs for images
  function convertImageUrl(url) {
    if (!url) return url
    // Convert /api/admin/proxy/products%2Ffile.webp to /media/products/file.webp
    return url.replace(/^\/api\/admin\/proxy\/(.*)$/, (match, encodedPath) => {
      const decodedPath = decodeURIComponent(encodedPath)
      return `/media/${decodedPath}`
    })
  }
  
  // Convert all image URLs in product.images array
  if (product.images && Array.isArray(product.images)) {
    product.images = product.images.map(convertImageUrl)
  }


  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${product.name} - Yến Sào Đăk Lăk</title>
      <link rel="stylesheet" href="/styles.css">
      <style>
        body { font-family: "Be Vietnam Pro", sans-serif; background: #faf7f0; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .product-detail { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .price { font-size: 24px; color: #C8A15A; font-weight: bold; margin: 16px 0; }
        .btn { background: #C8A15A; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; }
        .btn:hover { background: #b8925a; }
        .back-link { color: #666; text-decoration: none; margin-bottom: 20px; display: inline-block; }
        .back-link:hover { color: #C8A15A; }
        .product-image { width: 100%; max-width: 400px; height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <a href="/" class="back-link">← Quay lại trang chủ</a>
        
        <div class="product-detail">
          ${product.images && product.images[0] ? 
            `<img src="${product.images[0]}" alt="${product.name}" class="product-image">` : 
            `<div style="width:100%; height:200px; background:#f0f0f0; border-radius:8px; display:flex; align-items:center; justify-content:center; margin-bottom:20px; color:#999;">Chưa có hình ảnh</div>`
          }
          
          <h1>${product.name}</h1>
          <div class="price">${new Intl.NumberFormat("vi-VN").format(product.price)}₫</div>
          
          <p style="color: #666; font-size: 16px;">${product.long_desc || product.desc || ""}</p>
          
          <div style="margin-top: 24px;">
            <a href="tel:1900xxxx" class="btn">📞 Liên hệ đặt hàng</a>
            <a href="https://wa.me/1900xxxx?text=${encodeURIComponent("Tôi muốn đặt " + product.name)}" class="btn" style="margin-left: 12px;">💬 WhatsApp</a>
          </div>
          
          <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #eee;">
            <h3>Thông tin sản phẩm</h3>
            <ul style="color: #666;">
              <li>✅ Nguồn gốc: Yến nhà trên đảo Phú Quốc</li>
              <li>✅ Quy trình sơ chế, chưng đúng kỹ thuật</li>
              <li>✅ Giữ nguyên thành phần tự nhiên</li>
              <li>✅ COA theo lô sản xuất</li>
            </ul>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
  
  return c.html(html)
})


app.get("/admin/", async (c) => {
  const adminHtml = await c.env.ASSETS.fetch(new Request(new URL("/admin/index.html", c.req.url).toString()))
  const response = new Response(adminHtml.body, {
    headers: {
      ...Object.fromEntries(adminHtml.headers),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    }
  })
  return response
})
})


// Serve product-navigation.js
app.get("/product-navigation.js?v=3", async (c) => {
  const script = `// Product navigation for homepage
document.addEventListener("DOMContentLoaded", function() {
  console.log("[yensao] product navigation script loaded");
  
  const productSlugs = {
    "70ml": "yen-chung-hu-70ml",
    "100ml": "yen-chung-hu-100ml",
    "50g": "yen-tinh-sach-50g", 
    "100g": "yen-tho-100g",
    "combo": "combo-qua-tang",
    "set": "set-dung-thu"
  };
  
  document.addEventListener("click", function(e) {
    const element = e.target.closest("div");
    if (!element) return;
    
    const text = element.textContent || "";
    let slug = null, productName = null;
    
    Object.keys(productSlugs).forEach(keyword => {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        productName = keyword;
        slug = productSlugs[keyword];
      }
    });
    
    if (slug) {
      console.log("[yensao] product clicked:", productName);
      e.preventDefault();
      e.stopPropagation();
      
      if (typeof gtag !== "undefined") {
        gtag("event", "select_item", {
          item_list_id: "homepage_products",
          item_list_name: "Homepage Products",
          items: [{
            item_id: slug,
            item_name: productName
          }]
        });
      }
      
      window.location.href = "/product/" + slug;
    }
  });
  
  console.log("[yensao] click enhancer active");
});`;
  
  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript; charset=UTF-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
});

// Serve static assets (HTML, CSS, JS, images) - this should be LAST
// Public image proxy for admin-uploaded images
app.get("/media/*", async (c) => {
  if (!c.env.MEDIA) return c.notFound()
  
  // Extract image path from /media/products/filename.webp
  const imagePath = c.req.path.replace("/media/", "")
  
  try {
    const obj = await c.env.MEDIA.get(imagePath)
    if (!obj) return c.notFound()
    
    return new Response(obj.body, {
      headers: {
        "Content-Type": obj.httpMetadata?.contentType || "image/webp",
        "Cache-Control": "public, max-age=31536000", // 1 year cache for images
        "ETag": obj.etag || ""
      }
    })
  } catch (error) {
    console.error("Error serving media:", error)
    return c.notFound()
  }
})


app.get("*", async (c) => {
  const url = new URL(c.req.url)
  if (url.pathname === '/') {
    // Serve index.html with injected navigation script and no-store
    const res = await c.env.ASSETS.fetch(new Request(new URL('/index.html', url).toString()))
    let html = await res.text()
    const scriptTag = '<script src="/product-navigation.js?v=3"></script>'
    const marker = /<\/body\s*>/i
    if (marker.test(html)) html = html.replace(marker, scriptTag + '</body>')
    else html = html + scriptTag
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-store', 'X-Yensao-Injected': 'static-script', 'X-Debug': 'v3-homepage' } })
  }
  return c.env.ASSETS.fetch(c.req.raw)
})

export default app