import { CategoryModel } from '../models/Category.js';

export class CategoryService {
  static async getAll() {
    return CategoryModel.findAll();
  }

  static async getAllCategories() {
    return this.getAll();
  }

  static async getById(slugOrId) {
    return CategoryModel.findById(slugOrId);
  }

  static async getCategoryById(slugOrId) {
    const category = await this.getById(slugOrId);
    if (!category) {
      const error = new Error('Category not found');
      error.status = 404;
      throw error;
    }
    return category;
  }
}

export default CategoryService;
