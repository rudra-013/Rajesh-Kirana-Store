import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import { getProductsByCategory } from '../data/products';
import { categories } from '../data/categories';
import './Category.css';

export default function Category() {
  const { category } = useParams();
  const [activeSubcategory, setActiveSubcategory] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');

  const catInfo = categories.find(
    (c) => c.slug === category || c.id === category
  );

  const subcategories = useMemo(() => {
    if (catInfo && catInfo.subcategories && catInfo.subcategories.length > 0) {
      return ['All', ...catInfo.subcategories];
    }
    return [];
  }, [catInfo]);

  const rawProducts = useMemo(() => {
    return getProductsByCategory(category, activeSubcategory);
  }, [category, activeSubcategory]);

  // Sorting logic
  const sortedProducts = useMemo(() => {
    const list = [...rawProducts];
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'discount') {
      list.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    }
    return list;
  }, [rawProducts, sortBy]);

  const categoryTitle = catInfo ? catInfo.name : category.replace(/-/g, ' ');

  return (
    <main className="page-content category-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/" className="breadcrumb__link">Home</Link>
          <span className="breadcrumb__sep">›</span>
          <span className="breadcrumb__current">{categoryTitle}</span>
          {activeSubcategory !== 'All' && (
            <>
              <span className="breadcrumb__sep">›</span>
              <span className="breadcrumb__current">{activeSubcategory}</span>
            </>
          )}
        </nav>

        {/* Clean Category Topbar: Title + Count + Sort */}
        <div className="category-header">
          <div className="category-header__left">
            <h1 className="category-header__title">{categoryTitle}</h1>
            <span className="category-header__count">{sortedProducts.length} items</span>
          </div>

          {sortedProducts.length > 1 && (
            <div className="category-header__sort">
              <label htmlFor="category-sort" className="category-header__sort-label">
                Sort by:
              </label>
              <select
                id="category-sort"
                className="category-header__select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort products"
              >
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Highest Discount</option>
              </select>
            </div>
          )}
        </div>

        {/* Subcategories Horizontal Bar (Atta, Rice, Dal, Besan, etc.) */}
        {subcategories.length > 0 && (
          <div className="category-subnav scroll-x" aria-label="Subcategories">
            {subcategories.map((sub) => (
              <button
                key={sub}
                type="button"
                className={`category-subnav__pill ${
                  activeSubcategory === sub ? 'active' : ''
                }`}
                onClick={() => setActiveSubcategory(sub)}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* Compact Product Grid */}
        {sortedProducts.length > 0 ? (
          <section className="category-products" aria-label="Products">
            <ProductGrid products={sortedProducts} />
          </section>
        ) : (
          <div className="empty-state">
            <div className="empty-state__icon">📦</div>
            <h2 className="empty-state__title">No products found in this section</h2>
            <p className="empty-state__subtitle">
              Try switching back to "All" or browse our other categories.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setActiveSubcategory('All')}
            >
              Show All {categoryTitle}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
