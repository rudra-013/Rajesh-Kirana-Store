import { useState } from 'react';
import { useCart } from '../context/CartContext';
import CartItem from './CartItem';
import { Link } from 'react-router-dom';
import './CartDrawer.css';

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    subtotal,
    deliveryFee,
    promoDiscount,
    appliedPromo,
    total,
    totalItems,
    applyPromo,
    removePromo,
    availableCoupons,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoMsg, setPromoMsg] = useState(null);
  const [showCoupons, setShowCoupons] = useState(false);

  if (!isOpen) return null;

  const handleApplyPromo = (codeToApply) => {
    const code = codeToApply || promoInput;
    if (!code || !code.trim()) return;
    const res = applyPromo(code);
    if (res.success) {
      setPromoMsg({ type: 'success', text: res.message });
      setPromoInput('');
    } else {
      setPromoMsg({ type: 'error', text: res.message });
    }
  };

  const handleRemovePromo = () => {
    removePromo();
    setPromoMsg(null);
    setPromoInput('');
  };

  return (
    <>
      <div className="overlay" onClick={closeCart} />
      <aside className="cart-drawer" aria-label="Shopping cart">
        {/* Header */}
        <div className="cart-drawer__header">
          <div className="cart-drawer__header-left">
            <span className="cart-drawer__header-icon">🛒</span>
            <h2 className="cart-drawer__title">My Cart</h2>
            {totalItems > 0 && (
              <span className="cart-drawer__count">{totalItems} items</span>
            )}
          </div>
          <button
            className="cart-drawer__close"
            onClick={closeCart}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Delivery info strip */}
        {items.length > 0 && (
          <div className="cart-drawer__delivery-strip">
            <span>🚀</span>
            <span>
              {deliveryFee === 0
                ? 'Free delivery on this order!'
                : `Add ₹${500 - subtotal} more for free delivery`}
            </span>
          </div>
        )}

        {/* Items */}
        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">🛒</div>
              <h3 className="empty-state__title">Your cart is empty</h3>
              <p className="empty-state__subtitle">
                Add some groceries to get started
              </p>
              <button className="btn btn-primary btn-sm" onClick={closeCart}>
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              <ul className="cart-drawer__item-list">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </ul>

              {/* Promo Code Section */}
              <div className="cart-promo">
                <div className="cart-promo__header">
                  <span className="cart-promo__title">Have a promo code?</span>
                  <button
                    type="button"
                    className="cart-promo__toggle-btn"
                    onClick={() => setShowCoupons(!showCoupons)}
                  >
                    {showCoupons ? 'Hide coupons' : 'View coupons'}
                  </button>
                </div>

                {appliedPromo ? (
                  <div className="cart-promo__applied">
                    <span className="cart-promo__applied-badge">
                      🏷️ {appliedPromo} applied
                    </span>
                    <button
                      type="button"
                      className="cart-promo__remove-btn"
                      onClick={handleRemovePromo}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form
                    className="cart-promo__form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleApplyPromo();
                    }}
                  >
                    <input
                      type="text"
                      className="cart-promo__input"
                      placeholder="Enter promo code"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      aria-label="Enter promo code"
                    />
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm cart-promo__apply-btn"
                      disabled={!promoInput.trim()}
                    >
                      Apply
                    </button>
                  </form>
                )}

                {promoMsg && (
                  <p className={`cart-promo__msg cart-promo__msg--${promoMsg.type}`}>
                    {promoMsg.text}
                  </p>
                )}

                {/* Available Coupons list */}
                {showCoupons && (
                  <div className="cart-promo__coupons">
                    <p className="cart-promo__coupons-heading">Available Coupons</p>
                    <div className="cart-promo__coupons-list">
                      {availableCoupons.map((coupon) => (
                        <div key={coupon.code} className="cart-promo__coupon-item">
                          <div className="cart-promo__coupon-info">
                            <span className="cart-promo__coupon-code">{coupon.code}</span>
                            <span className="cart-promo__coupon-desc">{coupon.title}</span>
                          </div>
                          <button
                            type="button"
                            className="cart-promo__coupon-apply"
                            onClick={() => handleApplyPromo(coupon.code)}
                            disabled={appliedPromo === coupon.code}
                          >
                            {appliedPromo === coupon.code ? 'Applied' : 'Apply'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__summary">
              <div className="cart-drawer__summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              {promoDiscount > 0 && (
                <div className="cart-drawer__summary-row cart-drawer__summary-row--discount">
                  <span>Promo discount ({appliedPromo})</span>
                  <span className="text-primary-color font-semibold">
                    -₹{promoDiscount}
                  </span>
                </div>
              )}

              <div className="cart-drawer__summary-row">
                <span>Delivery fee</span>
                <span className={deliveryFee === 0 ? 'text-primary-color font-semibold' : ''}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="divider" />
              <div className="cart-drawer__summary-row cart-drawer__summary-row--total">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="btn btn-primary btn-lg cart-drawer__checkout-btn"
              onClick={closeCart}
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
