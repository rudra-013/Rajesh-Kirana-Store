import { OrderService } from '../services/orderService.js';
import { successResponse, errorResponse } from '../utils/responseUtils.js';

export class OrderController {
  static async create(req, res, next) {
    try {
      const { items, addressId, address, promoCode, paymentMethod } = req.body;
      const order = await OrderService.createOrder(req.user.id, {
        items,
        addressId,
        address,
        promoCode,
        paymentMethod,
      });
      return successResponse(res, order, 'Order placed successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req, res, next) {
    try {
      const orders = await OrderService.getOrders(req.user.id);
      return successResponse(res, orders, 'Orders retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getCurrent(req, res, next) {
    try {
      const order = await OrderService.getCurrentOrder(req.user.id);
      return successResponse(res, order, 'Current active order');
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const order = await OrderService.getOrderById(id, req.user.id);
      return successResponse(res, order, 'Order details');
    } catch (err) {
      next(err);
    }
  }

  static async cancel(req, res, next) {
    try {
      const { id } = req.params;
      const order = await OrderService.cancelOrder(id, req.user.id);
      return successResponse(res, order, 'Order cancelled successfully');
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        return errorResponse(res, 'Status is required', 400);
      }
      const updatedOrder = await OrderService.updateStatus(id, status);
      return successResponse(res, updatedOrder, `Order status updated to ${status}`);
    } catch (err) {
      next(err);
    }
  }
}
