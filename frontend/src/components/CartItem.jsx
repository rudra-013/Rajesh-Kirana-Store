import { useCart } from '../context/CartContext';
import './CartItem.css';

export default function CartItem({ item }) {
  const { increment, decrement, removeItem } = useCart();

  return (
    <li className="cart-item">
      {/* Emoji */}
      <div className="cart-item__emoji">{item.emoji}</div>

      {/* Info */}
      <div className="cart-item__info">
        <p className="cart-item__name">{item.name}</p>
        <p className="cart-item__qty-label">{item.quantity}</p>
        <p className="cart-item__unit-price">₹{item.price} each</p>
      </div>

      {/* Right: qty control + total */}
      <div className="cart-item__right">
        <div className="qty-control cart-item__qty-control">
          <button
            className="qty-control__btn"
            onClick={() => decrement(item.id)}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="qty-control__value">{item.qty}</span>
          <button
            className="qty-control__btn"
            onClick={() => increment(item.id)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <p className="cart-item__total">₹{item.price * item.qty}</p>
      </div>
    </li>
  );
}
