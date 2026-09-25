import { CartService } from '../services/cartService.js';
import { successResponse, errorResponse } from '../utils/responseUtils.js';

export class CartController {
  static async getCart(req, res, next) {
    try {
      const cart = await CartService.getCart(req.user.id);
      return successResponse(res, cart, 'User cart');
    } catch (err) {
      next(err);
    }
  }

  static async addItem(req, res, next) {
    try {
      const { productId, quantity } = req.body;
      if (!productId) {
        return errorResponse(res, 'Product ID is required', 400);
      }
      const cart = await CartService.addItem(req.user.id, productId, quantity || 1);
      return successResponse(res, cart, 'Item added to cart');
    } catch (err) {
      next(err);
    }
  }

  static async updateItem(req, res, next) {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      if (quantity === undefined) {
        return errorResponse(res, 'Quantity is required', 400);
      }
      const cart = await CartService.updateItem(req.user.id, productId, quantity);
      return successResponse(res, cart, 'Cart updated');
    } catch (err) {
      next(err);
    }
  }

  static async removeItem(req, res, next) {
    try {
      const { productId } = req.params;
      const cart = await CartService.removeItem(req.user.id, productId);
      return successResponse(res, cart, 'Item removed from cart');
    } catch (err) {
      next(err);
    }
  }

  static async clearCart(req, res, next) {
    try {
      const cart = await CartService.clearCart(req.user.id);
      return successResponse(res, cart, 'Cart cleared');
    } catch (err) {
      next(err);
    }
  }
}
