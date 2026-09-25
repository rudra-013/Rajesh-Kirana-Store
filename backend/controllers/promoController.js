import { PromoService } from '../services/promoService.js';
import { successResponse, errorResponse } from '../utils/responseUtils.js';

export class PromoController {
  static async getAll(req, res, next) {
    try {
      const promos = await PromoService.getAll();
      return successResponse(res, promos, 'Available promo codes');
    } catch (err) {
      next(err);
    }
  }

  static async validate(req, res, next) {
    try {
      const { code, cartTotal } = req.body;
      if (!code) {
        return errorResponse(res, 'Promo code is required', 400);
      }

      const result = await PromoService.validate(code, cartTotal);
      if (!result.valid) {
        return res.status(400).json({
          success: false,
          message: result.message,
          data: result,
        });
      }

      return successResponse(res, result, result.message);
    } catch (err) {
      next(err);
    }
  }
}
