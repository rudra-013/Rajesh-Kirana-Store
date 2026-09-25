import { useLocation, Link } from 'react-router-dom';
import { searchProducts } from '../data/products';
import ProductGrid from '../components/ProductGrid';

export default function SearchResults() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get('q') || '';
  const results = searchProducts(query);

  return (
    <main className="page-content">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/" className="breadcrumb__link">Home</Link>
          <span className="breadcrumb__sep">›</span>
          <span className="breadcrumb__current">Search results</span>
        </nav>

        <div style={{ marginBottom: 'var(--space-5)' }}>
          <h1 className="section-title" style={{ fontSize: 'var(--font-size-xl)' }}>
            {results.length > 0
              ? `${results.length} item${results.length !== 1 ? 's' : ''} found for "${query}"`
              : `No items found for "${query}"`}
          </h1>
        </div>

        {results.length > 0 ? (
          <section aria-label="Search results">
            <ProductGrid products={results} />
          </section>
        ) : (
          <div className="empty-state">
            <div className="empty-state__icon">🔍</div>
            <h2 className="empty-state__title">No matching groceries found</h2>
            <p className="empty-state__subtitle">
              Try searching with a different term like "milk", "atta", "oil", or "bananas".
            </p>
            <Link to="/" className="btn btn-primary">
              Browse Categories
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
