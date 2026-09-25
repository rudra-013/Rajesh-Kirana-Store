import { promoCodes } from '../data/promoCodes.js';

export class PromoModel {
  static async findAllActive() {
    return promoCodes.filter((p) => p.isActive).map((p) => ({ ...p }));
  }

  static async findActive() {
    return this.findAllActive();
  }

  static async findByCode(code) {
    if (!code) return null;
    const clean = code.trim().toUpperCase();
    const promo = promoCodes.find((p) => p.code === clean && p.isActive);
    return promo ? { ...promo } : null;
  }
}

export default PromoModel;
