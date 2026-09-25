import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addItem, increment, decrement, getItemQty } = useCart();
  const qty = getItemQty(product.id);
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    if (e.target.closest('.product-card__controls')) return;
    navigate(`/product/${product.id}`);
  };

  return (
    <article
      className="product-card"
      onClick={handleCardClick}
      aria-label={product.name}
    >
      {/* Product Image Area */}
      <div className="product-card__image-wrap">
        {product.discount > 0 && (
          <span className="product-card__badge">{product.discount}% OFF</span>
        )}
        <div className="product-card__emoji" aria-hidden="true">
          {product.emoji}
        </div>
      </div>

      {/* Info Body */}
      <div className="product-card__body">
        <div className="product-card__delivery">⏱ 10 MINS</div>
        <h3 className="product-card__name" title={product.name}>
          {product.name}
        </h3>
        <p className="product-card__qty-label">{product.quantity}</p>

        {/* Footer: Price + ADD button */}
        <div className="product-card__footer">
          <div className="product-card__price-block">
            <span className="product-card__price">₹{product.price}</span>
            {product.mrp && product.mrp > product.price && (
              <span className="product-card__mrp">₹{product.mrp}</span>
            )}
          </div>

          <div className="product-card__controls" onClick={(e) => e.stopPropagation()}>
            {qty === 0 ? (
              <button
                type="button"
                className="product-card__add-btn"
                onClick={() => addItem(product)}
                aria-label={`Add ${product.name} to cart`}
              >
                ADD
              </button>
            ) : (
              <div className="product-card__qty-control">
                <button
                  type="button"
                  className="product-card__qty-btn"
                  onClick={() => decrement(product.id)}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="product-card__qty-val">{qty}</span>
                <button
                  type="button"
                  className="product-card__qty-btn"
                  onClick={() => increment(product.id)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
