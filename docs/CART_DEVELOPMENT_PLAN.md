# 🛒 Cart Development Plan - Yến Sào Đăk Lăk

## 🎯 Features to implement:

### 1. **Client-side Cart Management**
- [ ] Local storage for cart data
- [ ] Add/remove items
- [ ] Update quantities
- [ ] Cart persistence across sessions

### 2. **Cart UI Components**
- [ ] Cart icon with item count badge
- [ ] Cart sidebar/dropdown
- [ ] Cart page/modal
- [ ] Mini cart preview

### 3. **Product Integration**
- [ ] "Thêm vào giỏ" buttons on homepage
- [ ] "Thêm vào giỏ" on product detail pages
- [ ] Quantity selectors

### 4. **Checkout Flow** 
- [ ] Cart summary
- [ ] Customer info form
- [ ] Order submission (WhatsApp/Phone)
- [ ] Order confirmation

### 5. **Backend Support** (if needed)
- [ ] Cart API endpoints
- [ ] Order management in admin
- [ ] Inventory tracking

## 🏗️ Implementation Strategy:

### Phase 1: Basic Cart Functionality
1. Cart JavaScript module
2. Local storage management
3. Add to cart buttons
4. Cart icon with count

### Phase 2: Cart UI
1. Cart sidebar/modal
2. Cart page
3. Quantity controls
4. Remove items

### Phase 3: Checkout
1. Checkout form
2. WhatsApp integration
3. Order submission

### Phase 4: Admin Integration
1. Order management
2. Inventory updates
3. Analytics

## 🛠️ Technical Approach:

### Client-side (No server state needed initially):
```javascript
// Cart data structure
{
  items: [
    {
      id: "yen-chung-hu-70ml",
      name: "Yến chưng hũ 70ml", 
      price: 89000,
      quantity: 2,
      image: "/media/products/..."
    }
  ],
  total: 178000,
  count: 2
}
```

### File structure:
```
public/
├── js/
│   ├── cart.js           # Cart management
│   ├── cart-ui.js        # UI components  
│   └── checkout.js       # Checkout flow
├── cart.html             # Dedicated cart page
└── checkout.html         # Checkout page
```

Let's start with Phase 1! 🚀
