import { carts } from '../data/carts.js';

export class CartModel {
  static async getCart(userId) {
    if (!carts[userId]) {
      carts[userId] = {
        userId,
        items: [],
        appliedPromo: null,
        updatedAt: new Date(),
      };
    }
    return { ...carts[userId], items: [...carts[userId].items] };
  }

  static async getByUserId(userId) {
    return this.getCart(userId);
  }

  static async addItem(userId, product, quantity = 1) {
    const cart = await this.getCart(userId);
    const existingIndex = cart.items.findIndex((item) => String(item.id) === String(product.id));

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        mrp: product.mrp,
        quantity,
        unit: product.quantity,
        image: product.image,
        category: product.category,
      });
    }

    cart.updatedAt = new Date();
    carts[userId] = cart;
    return { ...cart, items: [...cart.items] };
  }

  static async updateItem(userId, productId, quantity) {
    const cart = await this.getCart(userId);
    if (quantity <= 0) {
      cart.items = cart.items.filter((item) => String(item.id) !== String(productId));
    } else {
      const item = cart.items.find((item) => String(item.id) === String(productId));
      if (item) {
        item.quantity = quantity;
      }
    }

    cart.updatedAt = new Date();
    carts[userId] = cart;
    return { ...cart, items: [...cart.items] };
  }

  static async removeItem(userId, productId) {
    const cart = await this.getCart(userId);
    cart.items = cart.items.filter((item) => String(item.id) !== String(productId));
    cart.updatedAt = new Date();
    carts[userId] = cart;
    return { ...cart, items: [...cart.items] };
  }

  static async clearCart(userId) {
    carts[userId] = {
      userId,
      items: [],
      appliedPromo: null,
      updatedAt: new Date(),
    };
    return { ...carts[userId] };
  }

  static async clearByUserId(userId) {
    return this.clearCart(userId);
  }
}

export default CartModel;
