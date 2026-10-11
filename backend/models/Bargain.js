import { bargains } from '../data/bargains.js';
import { ProductModel } from './Product.js';

export class BargainModel {
  // Helper to check and mark expired requests
  static checkExpiry(request) {
    if (
      request.status === 'Accepted' &&
      request.expiryTime &&
      new Date() > new Date(request.expiryTime)
    ) {
      request.status = 'Expired';
    }
    return request;
  }

  static async findById(id) {
    const item = bargains.find((b) => b.id === id);
    if (!item) return null;
    return this.checkExpiry({ ...item });
  }

  static async findByCustomerId(customerId) {
    return bargains
      .filter((b) => b.customerId === customerId)
      .map((b) => this.checkExpiry({ ...b }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static async findAll() {
    return bargains
      .map((b) => this.checkExpiry({ ...b }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static async findPendingByCustomerAndProduct(customerId, productId) {
    const existing = bargains.find(
      (b) =>
        b.customerId === customerId &&
        String(b.productId) === String(productId) &&
        b.status === 'Pending'
    );
    if (!existing) return null;
    return this.checkExpiry({ ...existing });
  }

  static async create({
    customerId,
    customerName,
    customerPhone,
    productId,
    proposedPrice,
    quantity = 1,
    customerMessage = '',
  }) {
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new Error('Product not found.');
    }

    const proposed = Number(proposedPrice);
    if (isNaN(proposed) || proposed <= 0) {
      throw new Error('Proposed price must be greater than ₹0.');
    }
    if (proposed >= product.price) {
      throw new Error(`Proposed price must be lower than current product price (₹${product.price}).`);
    }

    const newRequest = {
      id: `bargain_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      customerId,
      customerName: customerName || 'Valued Customer',
      customerPhone: customerPhone || '9876543210',
      productId: product.id,
      productName: product.name,
      productImage: product.emoji || '📦',
      productQuantity: product.quantity,
      originalPrice: product.price,
      proposedPrice: proposed,
      quantity: Number(quantity) || 1,
      customerMessage: customerMessage.trim(),
      status: 'Pending',
      adminResponse: '',
      createdAt: new Date().toISOString(),
      respondedAt: null,
      expiryTime: null,
      used: false,
    };

    bargains.push(newRequest);
    return { ...newRequest };
  }

  static async accept(id, { adminResponse = '', expiryHours = 24 } = {}) {
    const index = bargains.findIndex((b) => b.id === id);
    if (index === -1) return null;

    const request = bargains[index];
    if (request.status !== 'Pending') {
      throw new Error(`Cannot accept request that is currently '${request.status}'.`);
    }

    const now = new Date();
    const expiry = new Date(now.getTime() + expiryHours * 60 * 60 * 1000);

    bargains[index].status = 'Accepted';
    bargains[index].adminResponse = adminResponse.trim() || 'Offer accepted! You can now buy at this price.';
    bargains[index].respondedAt = now.toISOString();
    bargains[index].expiryTime = expiry.toISOString();

    return { ...bargains[index] };
  }

  static async reject(id, { adminResponse = '' } = {}) {
    const index = bargains.findIndex((b) => b.id === id);
    if (index === -1) return null;

    const request = bargains[index];
    if (request.status !== 'Pending') {
      throw new Error(`Cannot reject request that is currently '${request.status}'.`);
    }

    const now = new Date();

    bargains[index].status = 'Rejected';
    bargains[index].adminResponse = adminResponse.trim() || 'Sorry, we cannot offer this price at the moment.';
    bargains[index].respondedAt = now.toISOString();

    return { ...bargains[index] };
  }

  static async markUsed(id) {
    const index = bargains.findIndex((b) => b.id === id);
    if (index !== -1) {
      bargains[index].used = true;
    }
  }
}

export default BargainModel;
