import { PromoModel } from '../models/Promo.js';

export class PromoService {
  static async getAll() {
    return PromoModel.findActive();
  }

  static async validate(code, cartTotal) {
    if (!code) {
      return {
        valid: false,
        discount: 0,
        message: 'Promo code is required',
      };
    }

    const promo = await PromoModel.findByCode(code);
    if (!promo || !promo.isActive) {
      return {
        valid: false,
        discount: 0,
        message: 'Invalid or inactive promo code',
      };
    }

    if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) {
      return {
        valid: false,
        discount: 0,
        message: 'Promo code has expired',
      };
    }

    const total = Number(cartTotal) || 0;
    if (total < promo.minOrder) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order amount of ₹${promo.minOrder} required for ${promo.code}`,
      };
    }

    let discount = 0;
    if (promo.discountType === 'PERCENTAGE') {
      discount = Math.round((total * promo.discount) / 100);
      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    } else {
      // FLAT discount
      discount = promo.discount;
    }

    // Never exceed cart total
    discount = Math.min(discount, total);

    return {
      valid: true,
      code: promo.code,
      discount,
      description: promo.description,
      message: `Coupon applied! You saved ₹${discount}`,
    };
  }
}
