import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../data/products';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const product = getProductById(id);
  const { addItem, increment, decrement, getItemQty } = useCart();
  const qty = product ? getItemQty(product.id) : 0;

  if (!product) {
    return (
      <main className="page-content">
        <div className="container">
          <div className="empty-state" style={{ paddingTop: 'var(--space-16)' }}>
            <div className="empty-state__icon">🔍</div>
            <h2 className="empty-state__title">Product not found</h2>
            <p className="empty-state__subtitle">
              This product doesn't exist or may have been removed.
            </p>
            <Link to="/" className="btn btn-primary">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const savings = product.mrp - product.price;

  return (
    <main className="page-content">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/" className="breadcrumb__link">Home</Link>
          <span className="breadcrumb__sep">›</span>
          <Link to={`/category/${product.category}`} className="breadcrumb__link">
            {product.category.replace(/-/g, ' ')}
          </Link>
          <span className="breadcrumb__sep">›</span>
          <span className="breadcrumb__current">{product.name}</span>
        </nav>

        <div className="product-detail">
          {/* Image */}
          <div className="product-detail__image-wrap">
            {product.discount > 0 && (
              <span className="product-detail__badge">{product.discount}% off</span>
            )}
            <div className="product-detail__emoji">{product.emoji}</div>
          </div>

          {/* Info */}
          <div className="product-detail__info">
            <p className="product-detail__qty-label">{product.quantity}</p>
            <h1 className="product-detail__name">{product.name}</h1>

            {/* Price row */}
            <div className="product-detail__price-row">
              <span className="product-detail__price">₹{product.price}</span>
              {product.mrp > product.price && (
                <>
                  <span className="product-detail__mrp">MRP ₹{product.mrp}</span>
                  <span className="product-detail__savings">Save ₹{savings}</span>
                </>
              )}
            </div>

            {/* Stock */}
            <p className="product-detail__stock">
              {product.stock > 10 ? (
                <span style={{ color: 'var(--color-primary)' }}>✓ In stock</span>
              ) : product.stock > 0 ? (
                <span style={{ color: 'var(--color-warning)' }}>
                  ⚠ Only {product.stock} left
                </span>
              ) : (
                <span style={{ color: 'var(--color-error)' }}>Out of stock</span>
              )}
            </p>

            <div className="divider" />

            {/* Description */}
            <div className="product-detail__desc-section">
              <h2 className="product-detail__desc-title">About this product</h2>
              <p className="product-detail__desc">{product.description}</p>
            </div>

            <div className="divider" />

            {/* Add to cart */}
            <div className="product-detail__cta">
              {qty === 0 ? (
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => addItem(product)}
                  disabled={product.stock === 0}
                >
                  Add to Cart
                </button>
              ) : (
                <div className="product-detail__qty-row">
                  <div className="qty-control product-detail__qty-control">
                    <button
                      className="qty-control__btn"
                      onClick={() => decrement(product.id)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="qty-control__value">{qty}</span>
                    <button
                      className="qty-control__btn"
                      onClick={() => increment(product.id)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <p className="product-detail__added-msg">Added to cart</p>
                </div>
              )}
            </div>

            {/* Delivery note */}
            <div className="product-detail__delivery-note">
              <span>🚀</span>
              <span>Estimated delivery: <strong>10–20 minutes</strong></span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
