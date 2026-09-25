import { CategoryService } from '../services/categoryService.js';
import { successResponse, errorResponse } from '../utils/responseUtils.js';

export class CategoryController {
  static async getAll(req, res, next) {
    try {
      const categories = await CategoryService.getAll();
      return successResponse(res, categories, 'Categories retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const category = await CategoryService.getById(id);
      if (!category) {
        return errorResponse(res, 'Category not found', 404);
      }
      return successResponse(res, category, 'Category details');
    } catch (err) {
      next(err);
    }
  }
}
