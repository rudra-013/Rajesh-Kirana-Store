import { OrderModel } from '../models/Order.js';
import { ProductModel } from '../models/Product.js';
import { AddressModel } from '../models/Address.js';
import { PromoService } from './promoService.js';
import { CartModel } from '../models/Cart.js';
import { BargainModel } from '../models/Bargain.js';

export class OrderService {
  /**
   * Create a new order with server-validated pricing & bargaining validation
   */
  static async createOrder(userId, { items, addressId, address, promoCode, paymentMethod = 'COD' }) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      const error = new Error('Order must contain at least one item');
      error.status = 400;
      throw error;
    }

    // Resolve address
    let deliveryAddress = null;
    if (addressId) {
      const savedAddress = await AddressModel.findById(addressId);
      if (!savedAddress || savedAddress.userId !== userId) {
        const error = new Error('Delivery address not found or does not belong to user');
        error.status = 400;
        throw error;
      }
      deliveryAddress = {
        label: savedAddress.label,
        address: savedAddress.address,
        city: savedAddress.city,
        pincode: savedAddress.pincode,
        phone: savedAddress.phone || '',
      };
    } else if (address && (address.address || address.street)) {
      deliveryAddress = {
        label: address.label || 'Home',
        address: address.address || address.street || '',
        city: address.city || '',
        pincode: address.pincode || '',
        phone: address.phone || '',
      };
    } else {
      const error = new Error('A valid delivery address is required');
      error.status = 400;
      throw error;
    }

    // Validate all items and calculate prices strictly from backend products & approved bargains
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const productId = item.id || item.productId;
      const quantity = parseInt(item.quantity, 10);

      if (!productId || isNaN(quantity) || quantity <= 0) {
        const error = new Error('Invalid item or quantity');
        error.status = 400;
        throw error;
      }

      const product = await ProductModel.findById(productId);
      if (!product) {
        const error = new Error(`Product not found: ${productId}`);
        error.status = 404;
        throw error;
      }

      let effectivePrice = product.price;
      let isNegotiated = false;
      let bargainingRequestId = null;

      // Server-side Bargaining Validation
      if (item.bargainingRequestId || item.isNegotiated) {
        const reqId = item.bargainingRequestId;
        if (reqId) {
          const bargain = await BargainModel.findById(reqId);
          if (
            bargain &&
            bargain.customerId === userId &&
            String(bargain.productId) === String(product.id) &&
            bargain.status === 'Accepted' &&
            (!bargain.expiryTime || new Date() <= new Date(bargain.expiryTime))
          ) {
            effectivePrice = bargain.proposedPrice;
            isNegotiated = true;
            bargainingRequestId = bargain.id;
            await BargainModel.markUsed(bargain.id);
          } else {
            console.warn(`Invalid/expired bargain request ${reqId} for user ${userId}. Reverting to original price.`);
          }
        }
      }

      const itemTotal = effectivePrice * quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        name: product.name,
        category: product.category,
        quantity: product.quantity, // product unit size e.g. "1 kg"
        count: quantity,
        price: effectivePrice,
        originalPrice: product.price,
        negotiatedPrice: isNegotiated ? effectivePrice : null,
        bargainingRequestId: bargainingRequestId,
        isNegotiated,
        mrp: product.mrp,
        image: product.image,
        itemTotal,
      });
    }

    // Validate promo code if applied
    let promoDiscount = 0;
    let appliedPromo = null;
    if (promoCode) {
      const promoResult = await PromoService.validate(promoCode, subtotal);
      if (promoResult.valid) {
        promoDiscount = promoResult.discount;
        appliedPromo = promoResult.code;
      } else {
        const error = new Error(promoResult.message || 'Invalid promo code');
        error.status = 400;
        throw error;
      }
    }

    // Delivery fee rule: ₹20 standard, free for ₹500+
    const deliveryFee = subtotal >= 500 ? 0 : 20;
    const finalTotal = Math.max(0, subtotal - promoDiscount + deliveryFee);

    const newOrder = await OrderModel.create({
      userId,
      items: orderItems,
      subtotal,
      deliveryFee,
      promoDiscount,
      appliedPromo,
      finalTotal,
      address: deliveryAddress,
      paymentMethod,
    });

    // Clear cart for this user upon order placement
    await CartModel.clearCart(userId);

    return newOrder;
  }

  static async getOrders(userId) {
    return OrderModel.findByUser(userId);
  }

  static async getOrderById(orderId, userId) {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      const error = new Error('Order not found');
      error.status = 404;
      throw error;
    }

    if (order.userId !== userId) {
      const error = new Error('Access denied: You cannot view this order');
      error.status = 403;
      throw error;
    }

    return order;
  }

  static async getCurrentOrder(userId) {
    return OrderModel.findCurrentByUser(userId);
  }

  static async updateStatus(orderId, status) {
    const validStatuses = ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      const error = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      error.status = 400;
      throw error;
    }

    const updated = await OrderModel.updateStatus(orderId, status);
    if (!updated) {
      const error = new Error('Order not found');
      error.status = 404;
      throw error;
    }
    return updated;
  }

  static async cancelOrder(orderId, userId) {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      const error = new Error('Order not found');
      error.status = 404;
      throw error;
    }

    if (order.userId !== userId) {
      const error = new Error('Access denied: You cannot cancel this order');
      error.status = 403;
      throw error;
    }

    if (order.status === 'CANCELLED') {
      const error = new Error('Order is already cancelled');
      error.status = 400;
      throw error;
    }

    if (order.status === 'DELIVERED') {
      const error = new Error('Delivered orders cannot be cancelled');
      error.status = 400;
      throw error;
    }

    if (!['PLACED', 'CONFIRMED'].includes(order.status)) {
      const error = new Error(`Order cannot be cancelled in status: ${order.status}`);
      error.status = 400;
      throw error;
    }

    return OrderModel.updateStatus(orderId, 'CANCELLED');
  }
}
