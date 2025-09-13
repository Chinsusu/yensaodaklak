// Script để cập nhật các nút thêm giỏ hàng trên trang chủ
const products = [
  {
    id: 'yen-chung-70ml',
    name: 'Yến chưng hũ 70 ml',
    price: 89000,
    image: '/media/yen-chung-70ml.jpg'
  },
  {
    id: 'yen-tinh-50g', 
    name: 'Yến tinh sạch 50 g',
    price: 1290000,
    image: '/media/yen-tinh-50g.jpg'
  },
  {
    id: 'yen-tho-100g',
    name: 'Yến thô 100 g', 
    price: 2350000,
    image: '/media/yen-tho-100g.jpg'
  },
  {
    id: 'yen-chung-100ml',
    name: 'Yến chưng hũ 100 ml',
    price: 109000,
    image: '/media/yen-chung-100ml.jpg'
  },
  {
    id: 'combo-gift',
    name: 'Combo quà tặng',
    price: 1990000,
    image: '/media/combo-gift.jpg'
  },
  {
    id: 'trial-set',
    name: 'Set dùng thử',
    price: 249000,
    image: '/media/trial-set.jpg'
  }
];

console.log('Products data:');
products.forEach(p => {
  console.log(`ID: ${p.id}, Name: ${p.name}, Price: ${p.price}`);
});
