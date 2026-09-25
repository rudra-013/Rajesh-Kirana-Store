import { categories } from '../data/categories.js';

export class CategoryModel {
  static async findAll() {
    return [...categories];
  }

  static async findById(slugOrId) {
    if (!slugOrId) return null;
    const cat = categories.find((c) => c.slug === slugOrId || c.id === slugOrId);
    return cat ? { ...cat } : null;
  }
}

export default CategoryModel;
