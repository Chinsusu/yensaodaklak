/**
 * 🛒 Yến Sào Cart Management - Simplified Version
 * Simple cart without WhatsApp integration
 */

class YenSaoCart {
  constructor() {
    this.storageKey = 'yensao_cart';
    this.listeners = [];
    this.cart = this.loadFromStorage();
    
    // Auto-save cart changes
    this.setupAutoSave();
    
    // Update UI elements on initialization
    this.updateCartCount();
    
    console.log('🛒 YenSao Cart initialized');
  }

  /**
   * Load cart from localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          items: Array.isArray(parsed.items) ? parsed.items : [],
          total: parsed.total || 0,
          count: parsed.count || 0
        };
      }
    } catch (error) {
      console.warn('Error loading cart from storage:', error);
    }
    
    return {
      items: [],
      total: 0,
      count: 0
    };
  }

  /**
   * Save cart to localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
    } catch (error) {
      console.warn('Error saving cart to storage:', error);
    }
  }

  /**
   * Setup auto-save functionality
   */
  setupAutoSave() {
    // Debounced save function
    let saveTimeout;
    const debouncedSave = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        this.saveToStorage();
      }, 300);
    };

    // Override cart property to trigger save on changes
    this._cart = this.cart;
    Object.defineProperty(this, 'cart', {
      get() {
        return this._cart;
      },
      set(value) {
        this._cart = value;
        debouncedSave();
      }
    });
  }

  /**
   * Add item to cart
   */
  addItem(product) {
    if (!this.validateProduct(product)) {
      console.warn('Invalid product data:', product);
      return false;
    }

    const existingItem = this.cart.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || null,
        unit: product.unit || 'hộp',
        quantity: 1
      });
    }

    this.updateTotals();
    this.notifyListeners('add', product);
    this.updateCartCount();
    
    return true;
  }

  /**
   * Remove item from cart
   */
  removeItem(productId) {
    const itemIndex = this.cart.items.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
      const removedItem = this.cart.items.splice(itemIndex, 1)[0];
      this.updateTotals();
      this.notifyListeners('remove', removedItem);
      this.updateCartCount();
      return true;
    }
    
    return false;
  }

  /**
   * Update item quantity
   */
  updateQuantity(productId, newQuantity) {
    if (newQuantity < 0) {
      return this.removeItem(productId);
    }
    
    if (newQuantity === 0) {
      return this.removeItem(productId);
    }

    const item = this.cart.items.find(item => item.id === productId);
    
    if (item) {
      const oldQuantity = item.quantity;
      item.quantity = Math.max(1, Math.min(99, newQuantity)); // Limit between 1-99
      
      this.updateTotals();
      this.notifyListeners('update', { ...item, oldQuantity });
      this.updateCartCount();
      return true;
    }
    
    return false;
  }

  /**
   * Clear entire cart
   */
  clearCart() {
    this.cart = {
      items: [],
      total: 0,
      count: 0
    };
    
    this.notifyListeners('clear');
    this.updateCartCount();
  }

  /**
   * Get cart data
   */
  getCart() {
    return {
      ...this.cart,
      items: [...this.cart.items] // Return copy to prevent direct mutation
    };
  }

  /**
   * Get item count
   */
  getItemCount() {
    return this.cart.count;
  }

  /**
   * Get total price
   */
  getTotal() {
    return this.cart.total;
  }

  /**
   * Check if item is in cart
   */
  hasItem(productId) {
    return this.cart.items.some(item => item.id === productId);
  }

  /**
   * Get item quantity
   */
  getItemQuantity(productId) {
    const item = this.cart.items.find(item => item.id === productId);
    return item ? item.quantity : 0;
  }

  /**
   * Validate product data
   */
  validateProduct(product) {
    return product && 
           typeof product.id === 'string' && 
           typeof product.name === 'string' && 
           typeof product.price === 'number' && 
           product.price > 0;
  }

  /**
   * Update cart totals
   */
  updateTotals() {
    this.cart.total = this.cart.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    this.cart.count = this.cart.items.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);
  }

  /**
   * Update cart count in UI
   */
  updateCartCount() {
    const countElements = document.querySelectorAll('[data-cart-count]');
    countElements.forEach(element => {
      element.textContent = this.cart.count;
      element.style.display = this.cart.count > 0 ? 'flex' : 'none';
    });

    // Update add to cart button states
    this.updateButtonStates();
  }

  /**
   * Update button states based on cart contents
   */
  updateButtonStates() {
    const buttons = document.querySelectorAll('[data-add-to-cart]');
    buttons.forEach(button => {
      const productId = button.dataset.productId;
      if (productId && this.hasItem(productId)) {
        button.classList.add('in-cart');
        const quantity = this.getItemQuantity(productId);
        if (quantity > 1) {
          button.textContent = `Đã có ${quantity} trong giỏ`;
        } else {
          button.textContent = '✓ Đã thêm';
        }
      } else {
        button.classList.remove('in-cart');
        button.textContent = button.getAttribute('data-original-text') || 'Thêm vào giỏ';
      }
    });
  }

  /**
   * Get cart summary for display
   */
  getCartSummary() {
    if (this.cart.items.length === 0) {
      return 'Giỏ hàng trống';
    }

    const summary = this.cart.items.map(item => 
      `${item.name} x${item.quantity}`
    ).join(', ');
    
    return `${this.cart.count} sản phẩm: ${summary}`;
  }

  /**
   * Format price to Vietnamese currency
   */
  formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  }

  /**
   * Add event listener for cart changes
   */
  addListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }

  /**
   * Remove event listener
   */
  removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of cart changes
   */
  notifyListeners(action, data = null) {
    const event = {
      action,
      cart: this.getCart(),
      item: data,
      timestamp: new Date()
    };

    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.warn('Error in cart listener:', error);
      }
    });
  }

  /**
   * Export cart data (useful for debugging or data transfer)
   */
  exportCart() {
    return {
      cart: this.getCart(),
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
  }

  /**
   * Import cart data
   */
  importCart(cartData) {
    try {
      if (cartData && cartData.cart && Array.isArray(cartData.cart.items)) {
        this.cart = {
          items: cartData.cart.items.filter(item => this.validateProduct(item)),
          total: 0,
          count: 0
        };
        this.updateTotals();
        this.updateCartCount();
        this.notifyListeners('import');
        return true;
      }
    } catch (error) {
      console.warn('Error importing cart:', error);
    }
    return false;
  }
}

// Initialize cart when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Store original button texts
  document.querySelectorAll('[data-add-to-cart]').forEach(button => {
    if (!button.hasAttribute('data-original-text')) {
      button.setAttribute('data-original-text', button.textContent);
    }
  });

  // Initialize cart
  window.yenSaoCart = new YenSaoCart();
  
  console.log('🛒 Cart system ready');
});

// Handle page visibility changes to sync cart state
document.addEventListener('visibilitychange', function() {
  if (!document.hidden && window.yenSaoCart) {
    // Reload cart when page becomes visible (for multi-tab sync)
    const freshCart = window.yenSaoCart.loadFromStorage();
    if (JSON.stringify(freshCart) !== JSON.stringify(window.yenSaoCart.cart)) {
      window.yenSaoCart.cart = freshCart;
      window.yenSaoCart.updateCartCount();
      window.yenSaoCart.notifyListeners('sync');
    }
  }
});
