import { products } from '../data/products.js';

export class ProductModel {
  static async findAll() {
    return [...products];
  }

  static async findById(id) {
    const numId = parseInt(id, 10);
    const product = products.find((p) => p.id === numId);
    return product ? { ...product } : null;
  }

  static async findByCategory(categorySlug, subcategory = null) {
    if (!categorySlug) return [];
    const normalized = categorySlug.toLowerCase().trim();

    let list = products.filter((p) => {
      const pCat = p.category.toLowerCase().trim();
      if (pCat === normalized) return true;
      if (p.categoryName && p.categoryName.toLowerCase() === normalized) return true;

      // Aliases
      if (
        (normalized.includes('masala') || normalized.includes('oil') || normalized.includes('ghee')) &&
        pCat === 'masala-oil-more'
      )
        return true;

      if ((normalized.includes('fruit') || normalized.includes('veg')) && pCat === 'fruits-vegetables')
        return true;

      if ((normalized.includes('dairy') || normalized.includes('bread') || normalized.includes('egg')) && pCat === 'dairy-bread-eggs')
        return true;

      if ((normalized.includes('snack') || normalized.includes('munch')) && pCat === 'snacks-munchies')
        return true;

      if ((normalized.includes('drink') || normalized.includes('juice') || normalized.includes('beverage')) && (pCat === 'cold-drinks-juices' || pCat === 'beverages'))
        return true;

      if ((normalized.includes('atta') || normalized.includes('rice') || normalized.includes('dal')) && pCat === 'atta-rice-dal')
        return true;

      if ((normalized.includes('breakfast') || normalized.includes('instant')) && pCat === 'breakfast-instant-food')
        return true;

      if ((normalized.includes('sweet') || normalized.includes('tooth')) && pCat === 'sweet-tooth')
        return true;

      if ((normalized.includes('bakery') || normalized.includes('biscuit')) && pCat === 'bakery-biscuits')
        return true;

      if ((normalized.includes('tea') || normalized.includes('coffee')) && pCat === 'tea-coffee-drinks')
        return true;

      if (normalized.includes('baby') && pCat === 'baby-care') return true;
      if (normalized.includes('pet') && pCat === 'pet-care') return true;
      if ((normalized.includes('clean') || normalized.includes('household')) && (pCat === 'cleaning-essentials' || pCat === 'household-needs')) return true;
      if (normalized.includes('pharma') && pCat === 'pharma-wellness') return true;
      if (normalized.includes('personal') && pCat === 'personal-care') return true;

      return false;
    });

    if (subcategory && subcategory !== 'All') {
      list = list.filter(
        (p) => p.subcategory && p.subcategory.toLowerCase() === subcategory.toLowerCase()
      );
    }

    return list;
  }

  static async search(query) {
    if (!query) return [];
    const q = query.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }
}

export default ProductModel;
