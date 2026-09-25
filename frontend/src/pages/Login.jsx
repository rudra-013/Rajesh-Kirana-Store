import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Login.css';

export default function Login() {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const { login } = useCart();
  const navigate = useNavigate();

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
    // UI prototype: any 4-digit OTP is "valid"
    if (otp.length !== 4) return;
    login({
      name: 'Rudra Gharaliya',
      phone: phone || '9876543210',
      email: 'rudra@example.com',
    });
    navigate('/profile');
  };

  return (
    <main className="page-content login-page">
      <div className="container">
        <div className="login-card">
          {/* Header */}
          <div className="login-card__header">
            <Link to="/" className="login-card__logo">
              <span>🛒</span>
              <span>
                Kirana<span style={{ color: 'var(--color-primary)' }}>Go</span>
              </span>
            </Link>
            <h1 className="login-card__title">
              {step === 'phone' ? 'Login or Sign up' : 'Enter OTP'}
            </h1>
            <p className="login-card__sub">
              {step === 'phone'
                ? 'Enter your mobile number to continue'
                : `OTP sent to +91 ${phone}`}
            </p>
          </div>

          {/* Phone step */}
          {step === 'phone' && (
            <form className="login-form" onSubmit={handlePhoneSubmit} noValidate>
              <div className="login-form__field">
                <label htmlFor="phone" className="login-form__label">
                  Mobile Number
                </label>
                <div className="login-form__phone-wrap">
                  <span className="login-form__prefix">+91</span>
                  <input
                    id="phone"
                    type="tel"
                    className="login-form__input"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={10}
                    autoComplete="tel"
                    inputMode="numeric"
                  />
                </div>
                {phoneError && (
                  <p className="login-form__error" role="alert">{phoneError}</p>
                )}
              </div>

              <button
                id="continue-btn"
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
              >
                Continue
              </button>

              <p className="login-form__disclaimer">
                By continuing, you agree to our{' '}
                <a href="#" className="login-form__link">Terms of Service</a> and{' '}
                <a href="#" className="login-form__link">Privacy Policy</a>
              </p>

              {/* Divider */}
              <div className="login-divider">
                <span>or continue with</span>
              </div>

              {/* Google placeholder */}
              <button
                type="button"
                id="google-login-btn"
                className="login-google-btn"
                onClick={() => {}}
                disabled
              >
                <span className="login-google-icon">G</span>
                Continue with Google
                <span className="login-google-tag">Coming soon</span>
              </button>
            </form>
          )}

          {/* OTP step */}
          {step === 'otp' && (
            <form className="login-form" onSubmit={handleOtpSubmit} noValidate>
              <div className="login-form__field">
                <label htmlFor="otp" className="login-form__label">
                  4-digit OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  className="login-form__input login-form__input--otp"
                  placeholder="• • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
                <p className="login-form__hint">
                  This is a UI prototype. Enter any 4 digits to proceed.
                </p>
              </div>

              <button
                id="verify-otp-btn"
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={otp.length !== 4}
              >
                Verify OTP
              </button>

              <button
                type="button"
                className="login-form__link"
                style={{ display: 'block', textAlign: 'center', marginTop: 'var(--space-3)' }}
                onClick={() => setStep('phone')}
              >
                Change number
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
