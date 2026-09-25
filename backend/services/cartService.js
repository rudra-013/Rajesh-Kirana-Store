import { CartModel } from '../models/Cart.js';
import { ProductModel } from '../models/Product.js';

export class CartService {
  static async getCart(userId) {
    return CartModel.getCart(userId);
  }

  static async addItem(userId, productId, quantity = 1) {
    const product = await ProductModel.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.status = 404;
      throw error;
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    return CartModel.addItem(userId, product, qty);
  }

  static async updateItem(userId, productId, quantity) {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) {
      const error = new Error('Invalid quantity');
      error.status = 400;
      throw error;
    }

    return CartModel.updateItem(userId, productId, qty);
  }

  static async removeItem(userId, productId) {
    return CartModel.removeItem(userId, productId);
  }

  static async clearCart(userId) {
    return CartModel.clearCart(userId);
  }
}
