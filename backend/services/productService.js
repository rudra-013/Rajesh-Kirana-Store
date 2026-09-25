import { ProductModel } from '../models/Product.js';

export class ProductService {
  static async getAll() {
    return ProductModel.findAll();
  }

  static async getAllProducts() {
    return this.getAll();
  }

  static async getById(id) {
    return ProductModel.findById(id);
  }

  static async getProductById(id) {
    const product = await this.getById(id);
    if (!product) {
      const error = new Error('Product not found');
      error.status = 404;
      throw error;
    }
    return product;
  }

  static async getByCategory(category, subcategory) {
    return ProductModel.findByCategory(category, subcategory);
  }

  static async getProductsByCategory(category, subcategory) {
    return this.getByCategory(category, subcategory);
  }

  static async search(query) {
    return ProductModel.search(query);
  }

  static async searchProducts(query) {
    return this.search(query);
  }
}

export default ProductService;
