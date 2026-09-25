export const promoCodes = [
  {
    code: 'SAVE50',
    title: '₹50 off on orders above ₹499',
    description: 'Use code SAVE50 to get flat ₹50 discount',
    minOrder: 499,
    discountType: 'flat',
    discountValue: 50,
    discount: 50,
    isActive: true,
  },
  {
    code: 'WELCOME10',
    title: '10% off on eligible orders',
    description: 'Get 10% off on your order up to ₹100',
    minOrder: 150,
    discountType: 'percentage',
    discountValue: 10,
    discount: 10,
    maxDiscount: 100,
    isActive: true,
  },
  {
    code: 'FRESH10',
    title: 'Extra 10% off on fresh kirana',
    description: 'Fresh kirana produce discount up to ₹100',
    minOrder: 100,
    discountType: 'percentage',
    discountValue: 10,
    discount: 10,
    maxDiscount: 100,
    isActive: true,
  },
];

export default promoCodes;
