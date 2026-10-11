// In-memory bargaining requests array
export const bargains = [
  {
    id: 'bargain_1',
    customerId: 'user_1',
    customerName: 'Rudra Gharaliya',
    customerPhone: '9876543210',
    productId: 2,
    productName: 'Saffola Gold Edible Oil',
    productImage: '🫙',
    productQuantity: '1 L',
    originalPrice: 165,
    proposedPrice: 145,
    quantity: 1,
    customerMessage: 'Can I get this for ₹145 if I order today?',
    status: 'Pending',
    adminResponse: '',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    respondedAt: null,
    expiryTime: null,
    used: false,
  },
];

export default bargains;
