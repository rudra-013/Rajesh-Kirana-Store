import { Link } from 'react-router-dom';
import './OrderSuccess.css';

export default function OrderSuccess() {
  const estimatedTime = '15–20 minutes';
  const orderId = `KG${Math.floor(Math.random() * 900000 + 100000)}`;

  return (
    <main className="page-content order-success-page">
      <div className="container">
        <div className="order-success-card">
          {/* Success icon */}
          <div className="order-success__icon-wrap" aria-hidden="true">
            <span className="order-success__icon">✓</span>
          </div>

          <h1 className="order-success__title">Order Placed!</h1>
          <p className="order-success__subtitle">
            Your grocery order has been received and is being prepared.
          </p>

          <div className="order-success__order-id">
            Order ID: <strong>{orderId}</strong>
          </div>

          {/* Delivery estimate */}
          <div className="order-success__eta">
            <div className="order-success__eta-icon">🚀</div>
            <div>
              <p className="order-success__eta-label">Estimated Delivery</p>
              <p className="order-success__eta-time">{estimatedTime}</p>
            </div>
          </div>

          {/* Status tracker */}
          <div className="order-success__tracker">
            <div className="tracker-step tracker-step--done">
              <span className="tracker-step__dot" />
              <span className="tracker-step__label">Order Confirmed</span>
            </div>
            <div className="tracker-step tracker-step--active">
              <span className="tracker-step__dot" />
              <span className="tracker-step__label">Preparing your order</span>
            </div>
            <div className="tracker-step">
              <span className="tracker-step__dot" />
              <span className="tracker-step__label">Out for Delivery</span>
            </div>
            <div className="tracker-step">
              <span className="tracker-step__dot" />
              <span className="tracker-step__label">Delivered</span>
            </div>
          </div>

          <p className="order-success__note">
            This is a UI prototype — no real order has been placed.
          </p>

          <Link to="/" className="btn btn-primary btn-lg order-success__home-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
