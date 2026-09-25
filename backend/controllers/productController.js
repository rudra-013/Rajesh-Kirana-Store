import { ProductService } from '../services/productService.js';
import { successResponse, errorResponse } from '../utils/responseUtils.js';

export class ProductController {
  static async getAll(req, res, next) {
    try {
      const { category, subCategory, sort } = req.query;
      let products;
      if (category) {
        products = await ProductService.getByCategory(category, subCategory);
      } else {
        products = await ProductService.getAll();
      }

      if (sort === 'price_asc') {
        products.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_desc') {
        products.sort((a, b) => b.price - a.price);
      } else if (sort === 'discount') {
        products.sort((a, b) => b.discount - a.discount);
      }

      return successResponse(res, products, 'Products retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const product = await ProductService.getById(id);
      if (!product) {
        return errorResponse(res, 'Product not found', 404);
      }
      return successResponse(res, product, 'Product details');
    } catch (err) {
      next(err);
    }
  }

  static async getByCategory(req, res, next) {
    try {
      const { category } = req.params;
      const { subCategory } = req.query;
      const products = await ProductService.getByCategory(category, subCategory);
      return successResponse(res, products, `Products for category: ${category}`);
    } catch (err) {
      next(err);
    }
  }

  static async search(req, res, next) {
    try {
      const { q } = req.query;
      const products = await ProductService.search(q);
      return successResponse(res, products, `Search results for: "${q || ''}"`);
    } catch (err) {
      next(err);
    }
  }
}
