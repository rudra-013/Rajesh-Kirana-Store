import { useState } from 'react';
import { useCart } from '../context/CartContext';
import './BargainModal.css';

export default function BargainModal({ product, onClose, onSuccess }) {
  const { user, submitBargainRequest } = useCart();

  const [proposedPrice, setProposedPrice] = useState(
    Math.round(product.price * 0.85) || product.price - 10
  );
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handlePriceChange = (e) => {
    const val = e.target.value;
    setProposedPrice(val);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numPrice = Number(proposedPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Please enter a valid price greater than ₹0.');
      return;
    }

    if (numPrice >= product.price) {
      setError(`Your offered price must be lower than the current price (₹${product.price}).`);
      return;
    }

    if (!user) {
      setError('Please log in to submit a price negotiation request.');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitBargainRequest({
        productId: product.id,
        proposedPrice: numPrice,
        quantity: Number(quantity) || 1,
        message: message.trim(),
      });
      setSubmittedSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to submit bargain request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bargain-modal-overlay" onClick={onClose}>
      <div className="bargain-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="bargain-modal-header">
          <h3 className="bargain-modal-title">🤝 Bargain Price Request</h3>
          <button className="bargain-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {submittedSuccess ? (
          <div className="bargain-modal-success">
            <div className="bargain-success-icon">🎉</div>
            <h4>Request Sent to Admin!</h4>
            <p className="bargain-success-msg">
              Your price request of <strong>₹{proposedPrice}</strong> for {product.name} has been sent. You will be notified once the admin responds.
            </p>
            <div className="bargain-success-actions">
              <button className="btn btn-primary" onClick={onClose}>
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <form className="bargain-modal-body" onSubmit={handleSubmit}>
            {/* Product Summary */}
            <div className="bargain-product-card">
              <div className="bargain-product-emoji">{product.emoji || '📦'}</div>
              <div className="bargain-product-info">
                <h4 className="bargain-product-name">{product.name}</h4>
                <p className="bargain-product-qty">Size: {product.quantity}</p>
                <div className="bargain-product-prices">
                  <span className="bargain-current-label">Current Price:</span>
                  <span className="bargain-current-price">₹{product.price}</span>
                  {product.mrp > product.price && (
                    <span className="bargain-mrp">MRP ₹{product.mrp}</span>
                  )}
                </div>
              </div>
            </div>

            {error && <div className="bargain-error-alert">⚠️ {error}</div>}

            {/* Input Form Fields */}
            <div className="bargain-form-group">
              <label className="bargain-label" htmlFor="proposed-price">
                Your Offer Price (₹) <span className="required">*</span>
              </label>
              <div className="bargain-price-input-wrap">
                <span className="bargain-currency-symbol">₹</span>
                <input
                  id="proposed-price"
                  type="number"
                  className="bargain-input bargain-input-price"
                  placeholder="e.g. 60"
                  value={proposedPrice}
                  onChange={handlePriceChange}
                  min="1"
                  max={product.price - 1}
                  required
                />
              </div>
              {proposedPrice && !isNaN(proposedPrice) && Number(proposedPrice) < product.price && (
                <p className="bargain-savings-hint">
                  You save <strong>₹{product.price - Number(proposedPrice)}</strong> ({Math.round(((product.price - Number(proposedPrice)) / product.price) * 100)}% off)
                </p>
              )}
            </div>

            <div className="bargain-form-group">
              <label className="bargain-label" htmlFor="bargain-quantity">
                Quantity
              </label>
              <select
                id="bargain-quantity"
                className="bargain-select"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 10].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'unit' : 'units'}
                  </option>
                ))}
              </select>
            </div>

            <div className="bargain-form-group">
              <label className="bargain-label" htmlFor="bargain-message">
                Message / Reason for Admin <span className="optional">(optional)</span>
              </label>
              <textarea
                id="bargain-message"
                className="bargain-textarea"
                rows="2"
                placeholder='e.g., "Can I get this for ₹60 if I buy 2 units?"'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="bargain-modal-footer">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary bargain-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending Request...' : 'Send Request 🤝'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
