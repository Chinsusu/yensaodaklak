/**
 * 🎨 Cart UI Components - Yến Sào Đăk Lăk
 * Cart sidebar, modal, and UI interactions
 */

class YenSaoCartUI {
  constructor() {
    this.isCartOpen = false;
    this.init();
  }

  init() {
    this.createCartElements();
    this.setupEventListeners();
    this.renderCartItems();
    
    // Listen for cart changes
    if (window.yenSaoCart) {
      window.yenSaoCart.addListener(this.handleCartChange.bind(this));
    }
    
    console.log('🎨 Cart UI initialized');
  }

  /**
   * Create cart UI elements
   */
  createCartElements() {
    // Create cart sidebar HTML
    const cartHTML = `
      <div id="cart-sidebar" class="cart-sidebar">
        <div class="cart-backdrop" onclick="yenSaoCartUI.closeCart()"></div>
        <div class="cart-panel">
          <div class="cart-header">
            <h3>🛒 Giỏ hàng</h3>
            <button class="cart-close" onclick="yenSaoCartUI.closeCart()">×</button>
          </div>
          
          <div class="cart-body">
            <!-- Empty state -->
            <div class="cart-empty" style="display: none;">
              <div class="empty-icon">🛒</div>
              <p>Giỏ hàng của bạn đang trống</p>
              <a href="/" class="btn btn-primary">Tiếp tục mua hàng</a>
            </div>
            
            <!-- Cart items -->
            <div class="cart-items" id="cart-items-list"></div>
          </div>
          
          <div class="cart-footer">
            <div class="cart-summary">
              <div class="total-row">
                <span>Tổng cộng:</span>
                <span class="cart-total">0₫</span>
              </div>
            </div>
            
            <div class="cart-actions">
              <button class="btn btn-outline" onclick="yenSaoCartUI.viewCart()">
                Xem giỏ hàng
              </button>
              <button class="btn btn-primary" onclick="yenSaoCartUI.checkout()">
                Đặt hàng ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add to page if not exists
    if (!document.getElementById('cart-sidebar')) {
      document.body.insertAdjacentHTML('beforeend', cartHTML);
    }

    // Add cart icon to header if not exists
    this.createCartIcon();
    
    // Add styles
    this.addCartStyles();
  }

  /**
   * Create cart icon in header
   */
  /**
   * Create cart icon in header
   */
  createCartIcon() {
    // Check if cart icon already exists in homepage
    const existingCartLink = document.querySelector("a[href*="cart"], a[aria-label*="giỏ"], a[aria-label*="Giỏ"]");
    
    if (existingCartLink) {
      // Use existing cart icon, just add click handler and count
      existingCartLink.addEventListener("click", function(e) {
        e.preventDefault();
        if (window.yenSaoCartUI) {
          window.yenSaoCartUI.toggleCart();
        }
      });
      
      // Add cart count to existing icon if not present
      if (!existingCartLink.querySelector("[data-cart-count]")) {
        const countSpan = document.createElement("span");
        countSpan.className = "absolute -top-1 -right-1 bg-gold text-white text-xs font-medium px-1.5 py-0.5 rounded-full";
        countSpan.setAttribute("data-cart-count", "");
        countSpan.textContent = "0";
        countSpan.style.display = "none";
        existingCartLink.appendChild(countSpan);
      }
      return;
    }
    
    // Only create new icon if none exists
    let cartIcon = document.getElementById("cart-icon");
    
    if (!cartIcon) {
      // Create cart icon HTML with proper shopping cart SVG
      const iconHTML = `
        <div id="cart-icon" class="cart-icon" onclick="yenSaoCartUI.toggleCart()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
          <span class="cart-count" data-cart-count>0</span>
        </div>
      `;
      
      // Try to add to header or create floating icon
      const header = document.querySelector("header, .header, nav");
      if (header) {
        header.insertAdjacentHTML("beforeend", iconHTML);
      } else {
        // Create floating cart icon
        document.body.insertAdjacentHTML("beforeend", `
          <div class="cart-icon-floating">${iconHTML}</div>
        `);
      }
    }
  }
  }

  /**
   * Add cart styles
   */
  addCartStyles() {
    if (document.getElementById('cart-styles')) return;
    
    const styles = `
      <style id="cart-styles">
        /* Cart Icon */
        .cart-icon {
          position: relative;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: background-color 0.2s;
          color: #4B3A2B;
        }
        .cart-icon:hover {
          background-color: rgba(200, 161, 90, 0.1);
        }
        .cart-icon svg {
          width: 24px;
          height: 24px;
        }
        .cart-count {
          position: absolute;
          top: 0;
          right: 0;
          background: #dc2626;
          color: white;
          border-radius: 10px;
          min-width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }
        .cart-icon-floating {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          background: white;
          border-radius: 50px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          padding: 12px;
        }
        
        /* Cart Sidebar */
        .cart-sidebar {
          position: fixed;
          top: 0;
          right: 0;
          width: 100%;
          height: 100%;
          z-index: 9999;
          visibility: hidden;
          opacity: 0;
          transition: all 0.3s ease;
        }
        .cart-sidebar.open {
          visibility: visible;
          opacity: 1;
        }
        .cart-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
        }
        .cart-panel {
          position: absolute;
          top: 0;
          right: 0;
          width: 400px;
          max-width: 90vw;
          height: 100%;
          background: white;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.3s ease;
        }
        .cart-sidebar.open .cart-panel {
          transform: translateX(0);
        }
        
        /* Cart Header */
        .cart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid #e5e5e5;
        }
        .cart-header h3 {
          margin: 0;
          font-size: 20px;
          color: #4B3A2B;
        }
        .cart-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 4px 8px;
          border-radius: 4px;
        }
        .cart-close:hover {
          background: #f3f4f6;
        }
        
        /* Cart Body */
        .cart-body {
          flex: 1;
          overflow-y: auto;
          padding: 0;
        }
        .cart-empty {
          padding: 40px 20px;
          text-align: center;
          color: #666;
        }
        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        /* Cart Items */
        .cart-items {
          padding: 0;
        }
        .cart-item {
          display: flex;
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
        }
        .cart-item-image {
          width: 60px;
          height: 60px;
          background: #f3f4f6;
          border-radius: 8px;
          margin-right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        .cart-item-details {
          flex: 1;
        }
        .cart-item-name {
          font-weight: 500;
          color: #4B3A2B;
          margin-bottom: 4px;
        }
        .cart-item-price {
          color: #C8A15A;
          font-weight: 500;
        }
        .cart-item-controls {
          display: flex;
          align-items: center;
          margin-top: 8px;
        }
        .quantity-btn {
          background: #f3f4f6;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .quantity-btn:hover {
          background: #e5e5e5;
        }
        .quantity-display {
          margin: 0 12px;
          font-weight: 500;
          min-width: 20px;
          text-align: center;
        }
        .remove-btn {
          background: none;
          border: none;
          color: #dc2626;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          margin-left: 12px;
        }
        .remove-btn:hover {
          background: #fee2e2;
        }
        
        /* Cart Footer */
        .cart-footer {
          padding: 20px;
          border-top: 1px solid #e5e5e5;
          background: #faf7f0;
        }
        .cart-summary {
          margin-bottom: 16px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 18px;
          font-weight: 600;
          color: #4B3A2B;
        }
        .cart-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        
        /* Buttons */
        .btn {
          padding: 12px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 500;
          text-decoration: none;
          text-align: center;
          transition: all 0.2s;
        }
        .btn-primary {
          background: #C8A15A;
          color: white;
        }
        .btn-primary:hover {
          background: #b8925a;
        }
        .btn-outline {
          background: white;
          color: #4B3A2B;
          border: 1px solid #C8A15A;
        }
        .btn-outline:hover {
          background: #fef7ed;
        }
        
        /* Add to cart button states */
        [data-add-to-cart].in-cart {
          background: #10b981 !important;
          color: white !important;
        }
        
        /* Mobile responsive */
        @media (max-width: 640px) {
          .cart-panel {
            width: 100%;
            max-width: 100%;
          }
          .cart-actions {
            grid-template-columns: 1fr;
          }
        }
      </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Close cart when clicking outside
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isCartOpen) {
        this.closeCart();
      }
    });
  }

  /**
   * Handle cart changes
   */
  handleCartChange(event) {
    this.renderCartItems();
    
    // Show notification for add to cart
    if (event.action === 'add') {
      this.showNotification(`✓ Đã thêm ${event.item.name} vào giỏ hàng`);
    }
  }

  /**
   * Toggle cart sidebar
   */
  toggleCart() {
    if (this.isCartOpen) {
      this.closeCart();
    } else {
      this.openCart();
    }
  }

  /**
   * Open cart sidebar
   */
  openCart() {
    const sidebar = document.getElementById('cart-sidebar');
    if (sidebar) {
      sidebar.classList.add('open');
      this.isCartOpen = true;
      document.body.style.overflow = 'hidden'; // Prevent background scroll
      this.renderCartItems();
    }
  }

  /**
   * Close cart sidebar
   */
  closeCart() {
    const sidebar = document.getElementById('cart-sidebar');
    if (sidebar) {
      sidebar.classList.remove('open');
      this.isCartOpen = false;
      document.body.style.overflow = ''; // Restore scroll
    }
  }

  /**
   * Render cart items
   */
  renderCartItems() {
    const container = document.getElementById('cart-items-list');
    if (!container) return;

    const cart = window.yenSaoCart ? window.yenSaoCart.getCart() : { items: [], total: 0, count: 0 };
    
    if (cart.items.length === 0) {
      container.innerHTML = '';
      return;
    }

    const itemsHTML = cart.items.map(item => `
      <div class="cart-item" data-item-id="${item.id}">
        <div class="cart-item-image">
          ${item.image ? 
            `<img src="${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">` :
            '🥄'
          }
        </div>
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${this.formatPrice(item.price)}</div>
          <div class="cart-item-controls">
            <button class="quantity-btn" onclick="yenSaoCartUI.updateQuantity('${item.id}', ${item.quantity - 1})">−</button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="quantity-btn" onclick="yenSaoCartUI.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
            <button class="remove-btn" onclick="yenSaoCartUI.removeItem('${item.id}')" title="Xóa sản phẩm">🗑️</button>
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = itemsHTML;
  }

  /**
   * Update item quantity
   */
  updateQuantity(productId, newQuantity) {
    if (window.yenSaoCart) {
      window.yenSaoCart.updateQuantity(productId, newQuantity);
    }
  }

  /**
   * Remove item from cart
   */
  removeItem(productId) {
    if (window.yenSaoCart) {
      window.yenSaoCart.removeItem(productId);
    }
  }

  /**
   * View cart page
   */
  viewCart() {
    window.location.href = '/cart.html';
  }

  /**
   * Start checkout process
   */
  checkout() {
    if (!window.yenSaoCart || window.yenSaoCart.getItemCount() === 0) {
      this.showNotification('Giỏ hàng của bạn đang trống');
      return;
    }

    // Close cart first
    this.closeCart();
    
    // Show contact info
    showContactInfo();
  }

  /**
   * Format price
   */
  formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  }

  /**
   * Show notification
   */
  showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    // Add slide in animation
    const keyframes = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = keyframes;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Initialize cart UI when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.yenSaoCartUI = new YenSaoCartUI();
});


// Contact info function (replaces WhatsApp checkout)
function showContactInfo() {
  const cart = window.yenSaoCart ? window.yenSaoCart.getCart() : { items: [], total: 0, count: 0 };
  
  if (cart.items.length === 0) {
    alert('Giỏ hàng của bạn đang trống');
    return;
  }

  const contactMessage = `Để đặt hàng các sản phẩm trong giỏ, vui lòng liên hệ:

📞 Hotline: 1900 xxxx
📧 Email: hello@yensao.com
🕐 Giờ làm việc: 8:00 - 18:00 (T2-T7)

Giỏ hàng của bạn:
${cart.items.map(item => 
  `• ${item.name} - SL: ${item.quantity} - Giá: ${new Intl.NumberFormat('vi-VN').format(item.price)}₫`
).join('\n')}

Tổng cộng: ${new Intl.NumberFormat('vi-VN').format(cart.total)}₫

Cảm ơn bạn đã quan tâm đến sản phẩm Yến Sào Đăk Lăk!`;

  alert(contactMessage);
}
