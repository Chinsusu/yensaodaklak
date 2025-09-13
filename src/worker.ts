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
  return adminHtml
})

app.get("/admin/", async (c) => {
  const adminHtml = await c.env.ASSETS.fetch(new Request(new URL("/admin/index.html", c.req.url).toString()))
  return adminHtml
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