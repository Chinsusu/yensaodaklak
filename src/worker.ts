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

// Handle admin UI specifically before wildcard route
app.get("/admin", async (c) => {
  const adminHtml = await c.env.ASSETS.fetch(new Request(new URL("/admin/index.html", c.req.url).toString()))
  return adminHtml
})

app.get("/admin/", async (c) => {
  const adminHtml = await c.env.ASSETS.fetch(new Request(new URL("/admin/index.html", c.req.url).toString()))
  return adminHtml
})


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
        
        /* Add to cart section styles */
        .quantity-btn:hover { background: #e0e0e0 !important; }
        .add-to-cart-btn:hover { background: #b8925a !important; }
        
        /* Mobile responsive */
        @media (max-width: 640px) {
          .container { padding: 10px; }
          div[style*="grid-template-columns: 1fr 1fr"] {
            display: block !important;
          }
          div[style*="grid-template-columns: 1fr 1fr"] > * {
            margin-bottom: 12px !important;
          }
          div[style*="grid-template-columns: 1fr 1fr"] > *:last-child {
            margin-bottom: 0 !important;
          }
        }
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
          
          <!-- Add to cart section -->
          <div style="margin-top: 32px; padding: 20px; background: #faf7f0; border-radius: 12px; border: 1px solid #e5e5e5;">
            <div style="margin-bottom: 20px;">
              <label style="font-weight: 500; color: #4B3A2B; margin-bottom: 8px; display: block;">Số lượng:</label>
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <button class="quantity-btn" onclick="changeQuantity(-1)" style="background: #f5f5f5; border: none; width: 40px; height: 40px; border-radius: 6px; cursor: pointer; font-size: 18px;">−</button>
                <input type="number" id="quantity" value="1" min="1" max="99" style="width: 60px; height: 40px; text-align: center; border: 1px solid #ddd; border-radius: 6px; font-size: 16px;">
                <button class="quantity-btn" onclick="changeQuantity(1)" style="background: #f5f5f5; border: none; width: 40px; height: 40px; border-radius: 6px; cursor: pointer; font-size: 18px;">+</button>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <button 
                class="add-to-cart-btn" 
                data-product-id="${product.slug}"
                data-product-name="${product.name}"
                data-product-price="${product.price}"
                data-product-image="/media/${product.slug}.jpg"
                onclick="addToCartWithQuantity(this)"
                style="background: #C8A15A; color: white; padding: 12px 16px; border: none; border-radius: 8px; font-size: 16px; font-weight: 500; cursor: pointer; transition: background 0.3s;">🛒 Thêm vào giỏ</button>
              
              <a href="tel:1900xxxx" class="btn" style="background: white; color: #4B3A2B; padding: 12px 16px; border: 1px solid #C8A15A; border-radius: 8px; font-size: 16px; font-weight: 500; text-decoration: none; text-align: center; transition: background 0.3s;">📞 Liên hệ</a>
            </div>
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
    
    <!-- Cart Scripts -->
    <script src="/js/cart.js"></script>
    <script src="/js/cart-ui.js"></script>
    
    <!-- Product Page JavaScript -->
    <script>
      // Change quantity function
      function changeQuantity(delta) {
        const quantityInput = document.getElementById("quantity");
        let currentValue = parseInt(quantityInput.value) || 1;
        let newValue = currentValue + delta;
        
        if (newValue < 1) newValue = 1;
        if (newValue > 99) newValue = 99;
        
        quantityInput.value = newValue;
      }
      
      // Add to cart with quantity
      function addToCartWithQuantity(button) {
        if (!window.yenSaoCart) {
          console.warn("Cart not initialized yet");
          alert("Giỏ hàng chưa sẵn sàng, vui lòng thử lại sau.");
          return;
        }
        
        const quantity = parseInt(document.getElementById("quantity").value) || 1;
        const productData = {
          id: button.dataset.productId,
          name: button.dataset.productName,
          price: parseInt(button.dataset.productPrice),
          image: button.dataset.productImage,
          unit: "hộp"
        };
        
        // Add multiple items to cart
        for (let i = 0; i < quantity; i++) {
          window.yenSaoCart.addItem(productData);
        }
        
        // Update button state
        const originalText = button.textContent;
        button.textContent = "✓ Đã thêm " + quantity + " sản phẩm";
        button.style.background = "#10b981";
        
        // Show cart sidebar
        if (window.yenSaoCartUI) {
          setTimeout(() => {
            window.yenSaoCartUI.openCart();
          }, 500);
        }
        
        // Reset button after 3 seconds
        setTimeout(() => {
          button.textContent = originalText;
          button.style.background = "#C8A15A";
        }, 3000);
        
        // GA4 tracking
        if (typeof gtag !== "undefined") {
          gtag("event", "add_to_cart", {
            currency: "VND",
            value: productData.price * quantity,
            items: [{
              item_id: productData.id,
              item_name: productData.name,
              quantity: quantity,
              price: productData.price
            }]
          });
        }
      }
      
      // Handle quantity input changes
      document.addEventListener("DOMContentLoaded", function() {
        const quantityInput = document.getElementById("quantity");
        if (quantityInput) {
          quantityInput.addEventListener("change", function() {
            let value = parseInt(this.value);
            if (isNaN(value) || value < 1) {
              this.value = 1;
            } else if (value > 99) {
              this.value = 99;
            }
          });
        }
        
        // Add hover effects to quantity buttons
        document.querySelectorAll(".quantity-btn").forEach(btn => {
          btn.addEventListener("mouseenter", function() {
            this.style.background = "#e0e0e0";
          });
          btn.addEventListener("mouseleave", function() {
            this.style.background = "#f5f5f5";
          });
        });
        
        // Add hover effect to add to cart button
        const addToCartBtn = document.querySelector(".add-to-cart-btn");
        if (addToCartBtn) {
          addToCartBtn.addEventListener("mouseenter", function() {
            if (this.style.background === "rgb(200, 161, 90)" || this.style.background === "#C8A15A") {
              this.style.background = "#b8925a";
            }
          });
          addToCartBtn.addEventListener("mouseleave", function() {
            if (this.style.background === "rgb(184, 146, 90)" || this.style.background === "#b8925a") {
              this.style.background = "#C8A15A";
            }
          });
        }
      });
    </script>
    </body>
    </html>
  `
  
  return c.html(html)
})


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


// Handle admin UI specifically with no-cache
app.get("*", async (c) => {
  return c.env.ASSETS.fetch(c.req.raw)
})

export default app

// Product detail page route
// Product detail page route