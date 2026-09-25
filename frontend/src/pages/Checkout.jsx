import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Checkout.css';

const SAVED_ADDRESSES = [
  {
    id: 1,
    label: 'Home',
    name: 'Rudra Gharaliya',
    line: '12, Navrang Society, Near Swaminarayan Temple',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380015',
  },
  {
    id: 2,
    label: 'Office',
    name: 'Rudra Gharaliya',
    line: 'B-201, GIFT City Tower 3',
    city: 'Gandhinagar',
    state: 'Gujarat',
    pincode: '382355',
  },
];

const PAYMENT_OPTIONS = [
  { id: 'upi', label: 'UPI', icon: '📱', desc: 'Pay via any UPI app' },
  { id: 'card', label: 'Card', icon: '💳', desc: 'Credit or Debit card' },
  { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when order arrives' },
];

export default function Checkout() {
  const { items, subtotal, deliveryFee, promoDiscount, appliedPromo, total, clearCart, createOrder, addresses } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState('address'); // 'address' | 'payment'
  const effectiveAddresses = addresses && addresses.length > 0 ? addresses : SAVED_ADDRESSES;
  const [selectedAddress, setSelectedAddress] = useState(effectiveAddresses[0]?.id || 1);
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    flat: '', area: '', city: '', pincode: '',
  });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (createOrder) {
        await createOrder({
          addressId: selectedAddress,
          paymentMethod: selectedPayment?.toUpperCase() || 'UPI',
        });
      } else {
        clearCart();
      }
      navigate('/order-success');
    } catch (err) {
      clearCart();
      navigate('/order-success');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && step === 'address') {
    return (
      <main className="page-content">
        <div className="container">
          <div className="empty-state" style={{ paddingTop: 'var(--space-16)' }}>
            <div className="empty-state__icon">🛒</div>
            <h2 className="empty-state__title">Your cart is empty</h2>
            <p className="empty-state__subtitle">Add items to proceed to checkout.</p>
            <a href="/" className="btn btn-primary">Start Shopping</a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-content">
      <div className="container">
        <div className="checkout-layout">
          {/* Left: Steps */}
          <div className="checkout-main">
            {/* Step Indicator */}
            <div className="checkout-steps">
              <div className={`checkout-step ${step === 'address' ? 'checkout-step--active' : 'checkout-step--done'}`}>
                <span className="checkout-step__num">
                  {step === 'payment' ? '✓' : '1'}
                </span>
                <span className="checkout-step__label">Delivery Address</span>
              </div>
              <div className="checkout-step__line" />
              <div className={`checkout-step ${step === 'payment' ? 'checkout-step--active' : ''}`}>
                <span className="checkout-step__num">2</span>
                <span className="checkout-step__label">Payment</span>
              </div>
            </div>

            {/* Address Step */}
            {step === 'address' && (
              <section className="checkout-section" aria-labelledby="address-heading">
                <h2 className="checkout-section__title" id="address-heading">
                  Select Delivery Address
                </h2>

                <div className="address-list">
                  {effectiveAddresses.map((addr) => (
                    <label key={addr.id} className="address-option" htmlFor={`addr-${addr.id}`}>
                      <input
                        type="radio"
                        id={`addr-${addr.id}`}
                        name="address"
                        value={addr.id}
                        checked={String(selectedAddress) === String(addr.id)}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="address-option__radio"
                      />
                      <div className="address-option__body">
                        <div className="address-option__top">
                          <span className="address-option__label">{addr.label || addr.type}</span>
                          <span className="address-option__name">{addr.name || 'Rudra Gharaliya'}</span>
                        </div>
                        <p className="address-option__line">{addr.address || addr.line}</p>
                        <p className="address-option__city">
                          {addr.city} {addr.pincode ? `– ${addr.pincode}` : ''}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Add new address */}
                <button
                  className="checkout-add-address-btn"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  {showAddForm ? '✕ Cancel' : '+ Add new address'}
                </button>

                {showAddForm && (
                  <form className="add-address-form" onSubmit={(e) => e.preventDefault()}>
                    <input
                      className="add-address-form__input"
                      placeholder="Flat / House No."
                      value={newAddress.flat}
                      onChange={(e) => setNewAddress({ ...newAddress, flat: e.target.value })}
                    />
                    <input
                      className="add-address-form__input"
                      placeholder="Area / Street"
                      value={newAddress.area}
                      onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
                    />
                    <div className="add-address-form__row">
                      <input
                        className="add-address-form__input"
                        placeholder="City"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      />
                      <input
                        className="add-address-form__input"
                        placeholder="Pincode"
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        maxLength={6}
                        inputMode="numeric"
                      />
                    </div>
                    <p className="add-address-form__note">
                      This is a UI prototype — address is not saved to any database.
                    </p>
                  </form>
                )}

                <button
                  className="btn btn-primary btn-lg checkout-continue-btn"
                  onClick={() => setStep('payment')}
                >
                  Continue to Payment →
                </button>
              </section>
            )}

            {/* Payment Step */}
            {step === 'payment' && (
              <section className="checkout-section" aria-labelledby="payment-heading">
                <h2 className="checkout-section__title" id="payment-heading">
                  Choose Payment Method
                </h2>

                <div className="payment-options">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <label key={opt.id} className="payment-option" htmlFor={`pay-${opt.id}`}>
                      <input
                        type="radio"
                        id={`pay-${opt.id}`}
                        name="payment"
                        value={opt.id}
                        checked={selectedPayment === opt.id}
                        onChange={() => setSelectedPayment(opt.id)}
                        className="payment-option__radio"
                      />
                      <div className="payment-option__body">
                        <span className="payment-option__icon">{opt.icon}</span>
                        <div>
                          <p className="payment-option__label">{opt.label}</p>
                          <p className="payment-option__desc">{opt.desc}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                <p className="checkout-prototype-note">
                  🔒 This is a UI prototype. No real payment is processed.
                </p>

                <form onSubmit={handlePlaceOrder}>
                  <button
                    id="place-order-btn"
                    type="submit"
                    className="btn btn-primary btn-lg checkout-continue-btn"
                  >
                    Place Order — ₹{total}
                  </button>
                </form>

                <button
                  className="checkout-back-btn"
                  onClick={() => setStep('address')}
                >
                  ← Back to Address
                </button>
              </section>
            )}
          </div>

          {/* Right: Order Summary */}
          <aside className="checkout-summary" aria-label="Order summary">
            <h2 className="checkout-summary__title">Order Summary</h2>

            <ul className="checkout-summary__items">
              {items.map((item) => (
                <li key={item.id} className="checkout-summary__item">
                  <span className="checkout-summary__item-emoji">{item.emoji}</span>
                  <div className="checkout-summary__item-info">
                    <p className="checkout-summary__item-name">{item.name}</p>
                    <p className="checkout-summary__item-qty">× {item.qty}</p>
                  </div>
                  <span className="checkout-summary__item-price">
                    ₹{item.price * item.qty}
                  </span>
                </li>
              ))}
            </ul>

            <div className="divider" />

            <div className="checkout-summary__totals">
              <div className="checkout-summary__row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="checkout-summary__row">
                  <span>Promo discount ({appliedPromo})</span>
                  <span className="text-primary-color font-semibold">-₹{promoDiscount}</span>
                </div>
              )}
              <div className="checkout-summary__row">
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? 'text-primary-color' : ''}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="divider" />
              <div className="checkout-summary__row checkout-summary__row--total">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
