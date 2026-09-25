import ProductCard from './ProductCard';
import './ProductGrid.css';

export default function ProductGrid({ products }) {
  if (!products || products.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🔍</div>
        <h3 className="empty-state__title">No products found</h3>
        <p className="empty-state__subtitle">
          Try a different search or browse our categories
        </p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
