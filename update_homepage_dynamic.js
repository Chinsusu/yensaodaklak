// Script để thêm vào homepage cho dynamic product loading
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Load products from API
    const response = await fetch('/api/products');
    const data = await response.json();
    const products = data.products || [];
    
    if (products.length === 0) return;
    
    // Update product section if exists
    const productGrid = document.querySelector('.product-grid, .bestsellers-grid');
    if (productGrid && products.length > 0) {
      productGrid.innerHTML = products.slice(0, 6).map(product => {
        const imageUrl = (product.images && product.images[0]) ? product.images[0] : '/images/placeholder-product.webp';
        const price = product.price ? new Intl.NumberFormat('vi-VN').format(product.price) + '₫' : 'Liên hệ';
        
        return `
          <div class="product-card bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div class="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
              <img src="${imageUrl}" alt="${product.name}" class="w-full h-full object-cover" loading="lazy">
            </div>
            <div class="p-4">
              <h3 class="font-semibold text-gray-900 mb-1">${product.name}</h3>
              <p class="text-sm text-gray-600 mb-2">${product.short_desc || ''}</p>
              <div class="flex items-center justify-between">
                <span class="font-bold text-gold">${price}</span>
                <button class="bg-gold text-white px-3 py-1 rounded text-sm hover:bg-gold/90">
                  Thêm
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  } catch (error) {
    console.log('Could not load dynamic products:', error);
  }
});
