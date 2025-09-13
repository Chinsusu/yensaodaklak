/**
 * 🛒 Cart Management System - Yến Sào Đăk Lăk
 * Client-side cart with localStorage persistence
 */

class YenSaoCart {
  constructor() {
    this.storageKey = 'yensao_cart';
    this.cart = this.loadFromStorage();
    this.listeners = new Set();
    
    // Initialize cart UI on page load
    this.updateCartUI();
    
    console.log('🛒 YenSaoCart initialized', this.cart);
  }

  /**
   * Load cart data from localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const cart = stored ? JSON.parse(stored) : { items: [], total: 0, count: 0 };
      return this.validateCart(cart);
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      return { items: [], total: 0, count: 0 };
    }
  }

  /**
   * Save cart data to localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  /**
   * Validate and clean cart data
   */
  validateCart(cart) {
    if (!cart || !Array.isArray(cart.items)) {
      return { items: [], total: 0, count: 0 };
    }
    
    // Recalculate totals in case of data inconsistency
    return this.recalculateTotals(cart);
  }

  /**
   * Recalculate cart totals
   */
  recalculateTotals(cart = this.cart) {
    let total = 0;
    let count = 0;
    
    cart.items.forEach(item => {
      if (item.price && item.quantity && item.quantity > 0) {
        total += item.price * item.quantity;
        count += item.quantity;
      }
    });
    
    cart.total = total;
    cart.count = count;
    
    return cart;
  }

  /**
   * Add item to cart or update quantity if exists
   */
  addItem(product, quantity = 1) {
    if (!product || !product.id || quantity <= 0) {
      console.error('Invalid product or quantity:', product, quantity);
      return false;
    }

    const existingItem = this.cart.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.image || null,
        slug: product.slug || product.id
      });
    }
    
    this.recalculateTotals();
    this.saveToStorage();
    this.notifyListeners('add', product, quantity);
    this.updateCartUI();
    
    console.log(`✅ Added ${quantity}x ${product.name} to cart`);
    return true;
  }

  /**
   * Remove item from cart completely
   */
  removeItem(productId) {
    const index = this.cart.items.findIndex(item => item.id === productId);
    
    if (index !== -1) {
      const removedItem = this.cart.items.splice(index, 1)[0];
      this.recalculateTotals();
      this.saveToStorage();
      this.notifyListeners('remove', removedItem);
      this.updateCartUI();
      
      console.log(`🗑️ Removed ${removedItem.name} from cart`);
      return true;
    }
    
    return false;
  }

  /**
   * Update item quantity
   */
  updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
      return this.removeItem(productId);
    }
    
    const item = this.cart.items.find(item => item.id === productId);
    
    if (item) {
      const oldQuantity = item.quantity;
      item.quantity = newQuantity;
      this.recalculateTotals();
      this.saveToStorage();
      this.notifyListeners('update', item, newQuantity - oldQuantity);
      this.updateCartUI();
      
      console.log(`📝 Updated ${item.name} quantity to ${newQuantity}`);
      return true;
    }
    
    return false;
  }

  /**
   * Get cart summary
   */
  getCart() {
    return { ...this.cart };
  }

  /**
   * Get item count
   */
  getItemCount() {
    return this.cart.count;
  }

  /**
   * Get total amount
   */
  getTotal() {
    return this.cart.total;
  }

  /**
   * Clear entire cart
   */
  clearCart() {
    this.cart = { items: [], total: 0, count: 0 };
    this.saveToStorage();
    this.notifyListeners('clear');
    this.updateCartUI();
    
    console.log('🧹 Cart cleared');
  }

  /**
   * Check if product is in cart
   */
  hasProduct(productId) {
    return this.cart.items.some(item => item.id === productId);
  }

  /**
   * Get specific item from cart
   */
  getItem(productId) {
    return this.cart.items.find(item => item.id === productId);
  }

  /**
   * Format price in Vietnamese currency
   */
  formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  }

  /**
   * Add event listener for cart changes
   */
  addListener(callback) {
    this.listeners.add(callback);
  }

  /**
   * Remove event listener
   */
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of cart changes
   */
  notifyListeners(action, item, quantity) {
    this.listeners.forEach(callback => {
      try {
        callback({ action, item, quantity, cart: this.getCart() });
      } catch (error) {
        console.error('Error in cart listener:', error);
      }
    });
  }

  /**
   * Update cart UI elements on page
   */
  updateCartUI() {
    // Update cart count badges
    const countElements = document.querySelectorAll('.cart-count, [data-cart-count]');
    countElements.forEach(el => {
      el.textContent = this.cart.count;
      el.style.display = this.cart.count > 0 ? '' : 'none';
    });

    // Update cart total displays
    const totalElements = document.querySelectorAll('.cart-total, [data-cart-total]');
    totalElements.forEach(el => {
      el.textContent = this.formatPrice(this.cart.total);
    });

    // Update cart empty state
    const emptyElements = document.querySelectorAll('.cart-empty');
    const hasItems = this.cart.count > 0;
    emptyElements.forEach(el => {
      el.style.display = hasItems ? 'none' : '';
    });

    // Update cart items displays
    const itemsElements = document.querySelectorAll('.cart-items');
    itemsElements.forEach(el => {
      el.style.display = hasItems ? '' : 'none';
    });

    // Update add to cart button states
    this.updateAddToCartButtons();
  }

  /**
   * Update add to cart button states
   */
  updateAddToCartButtons() {
    const buttons = document.querySelectorAll('[data-add-to-cart]');
    buttons.forEach(button => {
      const productId = button.dataset.addToCart;
      const item = this.getItem(productId);
      
      if (item) {
        button.classList.add('in-cart');
        const originalText = button.dataset.originalText || button.textContent;
        button.dataset.originalText = originalText;
        button.innerHTML = `✓ Trong giỏ (${item.quantity})`;
      } else {
        button.classList.remove('in-cart');
        if (button.dataset.originalText) {
          button.textContent = button.dataset.originalText;
        }
      }
    });
  }

  /**
   * Generate WhatsApp order message
   */
  generateWhatsAppMessage() {
    if (this.cart.count === 0) return '';
    
    let message = '🛒 *Đơn hàng từ Yến Sào Đăk Lăk*\n\n';
    
    this.cart.items.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   Số lượng: ${item.quantity}\n`;
      message += `   Đơn giá: ${this.formatPrice(item.price)}\n`;
      message += `   Thành tiền: ${this.formatPrice(item.price * item.quantity)}\n\n`;
    });
    
    message += `💰 *Tổng cộng: ${this.formatPrice(this.cart.total)}*\n\n`;
    message += 'Vui lòng xác nhận đơn hàng và thông tin giao hàng. Cảm ơn quý khách!';
    
    return message;
  }

  /**
   * Open WhatsApp with order details
   */
  orderViaWhatsApp(phoneNumber = '1900xxxx') {
    const message = this.generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Track order initiation
    if (typeof gtag !== 'undefined') {
      gtag('event', 'begin_checkout', {
        currency: 'VND',
        value: this.cart.total,
        items: this.cart.items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      });
    }
  }
}

// Initialize global cart instance
window.yenSaoCart = new YenSaoCart();

// Auto-setup add to cart buttons on page load
document.addEventListener('DOMContentLoaded', function() {
  // Setup add to cart buttons
  document.addEventListener('click', function(e) {
    const button = e.target.closest('[data-add-to-cart]');
    if (!button) return;
    
    e.preventDefault();
    
    const productId = button.dataset.addToCart;
    const productName = button.dataset.productName || 'Sản phẩm';
    const productPrice = parseInt(button.dataset.productPrice) || 0;
    const productImage = button.dataset.productImage || null;
    const quantity = parseInt(button.dataset.quantity) || 1;
    
    const product = {
      id: productId,
      name: productName,
      price: productPrice,
      image: productImage
    };
    
    const success = window.yenSaoCart.addItem(product, quantity);
    
    if (success) {
      // Show success feedback
      const originalText = button.textContent;
      button.textContent = '✓ Đã thêm!';
      button.style.backgroundColor = '#10b981';
      
      setTimeout(() => {
        window.yenSaoCart.updateCartUI();
      }, 1000);
    }
    
    // Track add to cart event
    if (typeof gtag !== 'undefined') {
      gtag('event', 'add_to_cart', {
        currency: 'VND',
        value: product.price * quantity,
        items: [{
          item_id: product.id,
          item_name: product.name,
          quantity: quantity,
          price: product.price
        }]
      });
    }
  });
  
  console.log('🛒 Cart auto-setup completed');
});

