// Add product click functionality to homepage
document.addEventListener('DOMContentLoaded', function() {
  // Product slug mapping
  const productSlugs = {
    'Yến chưng hũ 70 ml': 'yen-chung-hu-70ml',
    'Yến chưng hũ 100 ml': 'yen-chung-hu-100ml', 
    'Yến tinh sạch 50 g': 'yen-tinh-sach-50g',
    'Yến thô 100 g': 'yen-tho-100g',
    'Combo quà tặng': 'combo-qua-tang',
    'Set dùng thử': 'set-dung-thu'
  };

  // Find elements that contain product info using various selectors
  const productElements = [
    ...document.querySelectorAll('[onclick*="gtag"]'),
    ...document.querySelectorAll('strong:contains("70 ml")'),
    ...document.querySelectorAll('strong:contains("100 ml")'), 
    ...document.querySelectorAll('strong:contains("50 g")'),
    ...document.querySelectorAll('strong:contains("100 g")'),
    ...document.querySelectorAll('strong:contains("quà tặng")'),
    ...document.querySelectorAll('strong:contains("dùng thử")')
  ].filter(Boolean);

  // Also try to find by text content
  const allElements = document.querySelectorAll('*');
  allElements.forEach(el => {
    const text = el.textContent || '';
    if (text.includes('70 ml') || text.includes('100 ml') || text.includes('50 g') || 
        text.includes('100 g') || text.includes('quà tặng') || text.includes('dùng thử')) {
      // Find the closest clickable parent
      let parent = el;
      while (parent && parent !== document.body) {
        if (parent.tagName === 'DIV' && parent.children.length > 1) {
          productElements.push(parent);
          break;
        }
        parent = parent.parentElement;
      }
    }
  });

  // Remove duplicates
  const uniqueElements = [...new Set(productElements)];

  uniqueElements.forEach(element => {
    // Skip if already processed
    if (element.classList.contains('product-enhanced')) return;
    element.classList.add('product-enhanced');

    // Extract product name from element
    const textContent = element.textContent || '';
    let productName = null;
    let slug = null;

    // Try to match product name
    Object.keys(productSlugs).forEach(name => {
      if (textContent.includes(name)) {
        productName = name;
        slug = productSlugs[name];
      }
    });

    if (!slug) return; // Skip if can't identify product

    // Make element clickable
    element.style.cursor = 'pointer';
    element.style.transition = 'all 0.2s ease';
    element.style.userSelect = 'none';

    // Add hover effects
    element.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 4px 12px rgba(200, 161, 90, 0.2)';
    });

    element.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = 'none';
    });

    // Add click handler
    element.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      // Track click event
      if (typeof gtag !== 'undefined') {
        gtag('event', 'select_item', {
          item_list_id: 'homepage_products',
          item_list_name: 'Homepage Products',
          items: [{
            item_id: slug,
            item_name: productName
          }]
        });
      }

      // Navigate to product detail page
      window.location.href = '/product/' + slug;
    });

    // Add visual indicator
    if (!element.querySelector('.click-indicator')) {
      const indicator = document.createElement('div');
      indicator.className = 'click-indicator';
      indicator.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        width: 20px;
        height: 20px;
        background: rgba(200, 161, 90, 0.1);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: #C8A15A;
        pointer-events: none;
      `;
      indicator.innerHTML = '👁';
      
      // Make parent relative if needed
      if (getComputedStyle(element).position === 'static') {
        element.style.position = 'relative';
      }
      
      element.appendChild(indicator);
    }
  });

  console.log(`Enhanced ${uniqueElements.length} product elements for navigation`);
});

// CSS for better styling
const style = document.createElement('style');
style.textContent = `
  .product-enhanced {
    border-radius: 8px !important;
  }
  .product-enhanced:hover {
    background-color: rgba(200, 161, 90, 0.02) !important;
  }
`;
document.head.appendChild(style);
