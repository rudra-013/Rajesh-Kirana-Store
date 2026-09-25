import { orders } from '../data/orders.js';

export class OrderModel {
  static async findByUserId(userId) {
    return orders
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((o) => ({ ...o }));
  }

  static async findByUser(userId) {
    return this.findByUserId(userId);
  }

  static async findById(id) {
    const order = orders.find((o) => String(o.id) === String(id));
    return order ? { ...order } : null;
  }

  static async findCurrentByUserId(userId) {
    const activeStatuses = ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'];
    const current = orders.find(
      (o) => o.userId === userId && activeStatuses.includes(o.status)
    );
    return current ? { ...current } : null;
  }

  static async findCurrentByUser(userId) {
    return this.findCurrentByUserId(userId);
  }

  static async create(orderData) {
    const newOrder = {
      id: String(1000 + orders.length + 1),
      ...orderData,
      status: orderData.status || 'PLACED',
      eta: '10-15 mins',
      createdAt: new Date(),
    };
    orders.unshift(newOrder);
    return { ...newOrder };
  }

  static async updateStatus(id, newStatus) {
    const order = orders.find((o) => String(o.id) === String(id));
    if (!order) return null;
    order.status = newStatus;
    if (newStatus === 'DELIVERED') order.eta = 'Delivered';
    if (newStatus === 'CANCELLED') order.eta = 'Cancelled';
    return { ...order };
  }

  static async cancel(id, userId) {
    const order = orders.find((o) => String(o.id) === String(id) && o.userId === userId);
    if (!order) return { success: false, message: 'Order not found' };

    const cancellableStatuses = ['PLACED', 'CONFIRMED'];
    if (!cancellableStatuses.includes(order.status)) {
      return {
        success: false,
        message: `Order cannot be cancelled once it is ${order.status}`,
      };
    }

    order.status = 'CANCELLED';
    order.eta = 'Cancelled';
    return { success: true, order: { ...order } };
  }
}

export default OrderModel;
