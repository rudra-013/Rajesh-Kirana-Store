import { useState } from 'react';
import { useCart } from '../context/CartContext';
import './LoginModal.css';

export default function LoginModal({ isOpen, onClose }) {
  const { login } = useCart();
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneError, setPhoneError] = useState('');

  if (!isOpen) return null;

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setPhoneError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setPhoneError('');
    setStep('otp');
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otp.length !== 4) return;
    login({
      name: 'Rudra Gharaliya',
      phone: phone || '9876543210',
      email: 'rudra@example.com',
    });
    if (onClose) onClose();
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-modal" role="dialog" aria-modal="true">
        <button
          className="login-modal__close"
          onClick={onClose}
          aria-label="Close login dialog"
        >
          ✕
        </button>

        <div className="login-modal__header">
          <div className="login-modal__brand">
            <span className="login-modal__logo-icon">🛒</span>
            <span className="login-modal__brand-text">
              Kirana<span className="login-modal__brand-accent">Go</span>
            </span>
          </div>
          <h2 className="login-modal__title">
            {step === 'phone' ? 'Login or Sign up' : 'Verify Mobile Number'}
          </h2>
          <p className="login-modal__sub">
            {step === 'phone'
              ? 'Get fresh groceries delivered in 10 minutes'
              : `Enter the 4-digit OTP sent to +91 ${phone}`}
          </p>
        </div>

        {step === 'phone' ? (
          <form className="login-modal__form" onSubmit={handlePhoneSubmit}>
            <div className="login-modal__input-wrap">
              <span className="login-modal__prefix">+91</span>
              <input
                type="tel"
                className="login-modal__input"
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                autoFocus
              />
            </div>
            {phoneError && <p className="login-modal__error">{phoneError}</p>}

            <button type="submit" className="btn btn-primary login-modal__btn">
              Continue
            </button>

            <button
              type="button"
              className="login-modal__guest-btn"
              onClick={onClose}
            >
              Skip and browse groceries →
            </button>
          </form>
        ) : (
          <form className="login-modal__form" onSubmit={handleOtpSubmit}>
            <div className="login-modal__otp-field">
              <input
                type="text"
                className="login-modal__input login-modal__input--otp"
                placeholder="• • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                autoFocus
              />
            </div>
            <p className="login-modal__hint">Demo prototype: Enter any 4 numbers</p>

            <button
              type="submit"
              className="btn btn-primary login-modal__btn"
              disabled={otp.length !== 4}
            >
              Verify OTP & Start Shopping
            </button>

            <button
              type="button"
              className="login-modal__change-btn"
              onClick={() => setStep('phone')}
            >
              Change number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
