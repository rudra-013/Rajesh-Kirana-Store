import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { searchProducts } from '../data/products';
import './Header.css';

export default function Header() {
  const { totalItems, openCart, user, logout } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [location, setLocation] = useState('Ahmedabad, Gujarat');
  const searchRef = useRef(null);
  const accountRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setShowAccountDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length >= 2) {
      setSearchResults(searchProducts(q).slice(0, 6));
      setShowSuggestions(true);
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product) => {
    navigate(`/product/${product.id}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleNavigate = (path, tabName) => {
    setShowAccountDropdown(false);
    if (tabName) {
      navigate(path, { state: { tab: tabName } });
    } else {
      navigate(path);
    }
  };

  const handleLogout = async () => {
    setShowAccountDropdown(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="header" role="banner">
      <div className="container header__inner">
        {/* Logo */}
        <Link to="/" className="header__logo" aria-label="KiranaGo Home">
          <span className="header__logo-icon">🛒</span>
          <span className="header__logo-text">
            Kirana<span className="header__logo-accent">Go</span>
          </span>
        </Link>

        {/* Location + Search */}
        <div className="header__center">
          <button className="header__location" aria-label="Change delivery location">
            <span className="header__location-icon">📍</span>
            <div className="header__location-text">
              <span className="header__location-label">Deliver to</span>
              <span className="header__location-value">{location}</span>
            </div>
            <span className="header__location-chevron">›</span>
          </button>

          <div className="header__search-wrap" ref={searchRef}>
            <form className="header__search" onSubmit={handleSearchSubmit} role="search">
              <span className="header__search-icon" aria-hidden="true">🔍</span>
              <input
                id="header-search"
                type="search"
                className="header__search-input"
                placeholder="Search products, brands and more"
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                autoComplete="off"
                aria-label="Search products"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="header__search-clear"
                  onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSuggestions(false); }}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </form>

            {showSuggestions && searchResults.length > 0 && (
              <div className="header__suggestions" role="listbox" aria-label="Search suggestions">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    className="header__suggestion-item"
                    onClick={() => handleSuggestionClick(p)}
                    role="option"
                  >
                    <span className="header__suggestion-emoji">{p.emoji}</span>
                    <div className="header__suggestion-info">
                      <span className="header__suggestion-name">{p.name}</span>
                      <span className="header__suggestion-qty">{p.quantity}</span>
                    </div>
                    <span className="header__suggestion-price">₹{p.price}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Account Dropdown + Cart */}
        <div className="header__right">
          <div className="header__account-wrap" ref={accountRef}>
            <button
              type="button"
              className={`header__account-btn ${showAccountDropdown ? 'active' : ''}`}
              onClick={() => setShowAccountDropdown((prev) => !prev)}
              aria-expanded={showAccountDropdown}
              aria-haspopup="true"
              aria-label="Account menu"
            >
              <span className="header__account-text">Account</span>
              <span className={`header__account-chevron ${showAccountDropdown ? 'open' : ''}`}>▾</span>
            </button>

            {showAccountDropdown && (
              <div className="account-dropdown" role="menu">
                {/* Header Profile / Phone */}
                <div
                  className="account-dropdown__user-header"
                  onClick={() => handleNavigate(user ? '/profile' : '/login', 'profile')}
                  role="menuitem"
                >
                  <div className="account-dropdown__title">My Account</div>
                  <div className="account-dropdown__subtitle">
                    {user ? (user.phone || user.email || 'KiranaGo Member') : 'Log in or Sign up'}
                  </div>
                </div>

                {/* Options List */}
                <div className="account-dropdown__menu">
                  <button
                    type="button"
                    className="account-dropdown__item"
                    onClick={() => handleNavigate(user ? '/profile' : '/login', 'profile')}
                    role="menuitem"
                  >
                    My Account
                  </button>
                  <button
                    type="button"
                    className="account-dropdown__item"
                    onClick={() => handleNavigate(user ? '/profile' : '/login', 'orders')}
                    role="menuitem"
                  >
                    My Orders
                  </button>
                  <button
                    type="button"
                    className="account-dropdown__item"
                    onClick={() => handleNavigate(user ? '/profile' : '/login', 'bargains')}
                    role="menuitem"
                  >
                    My Bargains 🤝
                  </button>
                  <button
                    type="button"
                    className="account-dropdown__item"
                    onClick={() => handleNavigate('/admin')}
                    role="menuitem"
                    style={{ fontWeight: 600, color: '#0c831f' }}
                  >
                    Admin Dashboard 👑
                  </button>
                  <button
                    type="button"
                    className="account-dropdown__item"
                    onClick={() => handleNavigate(user ? '/profile' : '/login', 'addresses')}
                    role="menuitem"
                  >
                    Saved Addresses
                  </button>
                  <button
                    type="button"
                    className="account-dropdown__item"
                    onClick={() => handleNavigate(user ? '/profile' : '/login', 'faq')}
                    role="menuitem"
                  >
                    FAQ's
                  </button>
                  <button
                    type="button"
                    className="account-dropdown__item"
                    onClick={() => {
                      setShowAccountDropdown(false);
                      setShowPrivacyModal(true);
                    }}
                    role="menuitem"
                  >
                    Account Privacy
                  </button>

                  {user ? (
                    <button
                      type="button"
                      className="account-dropdown__item account-dropdown__item--logout"
                      onClick={handleLogout}
                      role="menuitem"
                    >
                      Log Out
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="account-dropdown__item account-dropdown__item--login"
                      onClick={() => handleNavigate('/login')}
                      role="menuitem"
                    >
                      Log In / Sign Up
                    </button>
                  )}
                </div>

                {/* Blinkit-style App Download QR Footer Banner */}
                <div className="account-dropdown__qr-banner">
                  <div className="account-dropdown__qr-box">
                    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="100" height="100" rx="8" fill="#F8F9FA"/>
                      <rect x="10" y="10" width="30" height="30" rx="4" fill="#111827"/>
                      <rect x="16" y="16" width="18" height="18" rx="2" fill="#FFFFFF"/>
                      <rect x="21" y="21" width="8" height="8" fill="#111827"/>
                      <rect x="60" y="10" width="30" height="30" rx="4" fill="#111827"/>
                      <rect x="66" y="16" width="18" height="18" rx="2" fill="#FFFFFF"/>
                      <rect x="71" y="21" width="8" height="8" fill="#111827"/>
                      <rect x="10" y="60" width="30" height="30" rx="4" fill="#111827"/>
                      <rect x="16" y="66" width="18" height="18" rx="2" fill="#FFFFFF"/>
                      <rect x="21" y="71" width="8" height="8" fill="#111827"/>
                      <rect x="50" y="50" width="10" height="10" fill="#111827"/>
                      <rect x="70" y="50" width="10" height="10" fill="#111827"/>
                      <rect x="50" y="70" width="10" height="10" fill="#111827"/>
                      <rect x="60" y="60" width="10" height="10" fill="#111827"/>
                      <rect x="80" y="70" width="10" height="10" fill="#111827"/>
                      <rect x="70" y="80" width="10" height="10" fill="#111827"/>
                      <rect x="50" y="80" width="10" height="10" fill="#111827"/>
                      <rect x="45" y="25" width="8" height="8" fill="#111827"/>
                    </svg>
                  </div>
                  <div className="account-dropdown__qr-text">
                    <p className="account-dropdown__qr-title">
                      Simple way to get groceries <span>at your doorstep</span>
                    </p>
                    <p className="account-dropdown__qr-sub">Scan the QR code and download KiranaGo app</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            className="header__cart"
            onClick={openCart}
            aria-label={`Cart with ${totalItems} items`}
          >
            <span className="header__cart-icon">🛒</span>
            <span className="header__cart-text">Cart</span>
            {totalItems > 0 && (
              <span className="header__cart-badge">{totalItems}</span>
            )}
          </button>
        </div>
      </div>

      {/* Account Privacy Modal */}
      {showPrivacyModal && (
        <div className="privacy-modal-overlay" onClick={() => setShowPrivacyModal(false)}>
          <div className="privacy-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="privacy-modal-header">
              <h3 className="privacy-modal-title">🔒 Account Privacy & Security</h3>
              <button
                className="privacy-modal-close"
                onClick={() => setShowPrivacyModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="privacy-modal-body">
              <p className="privacy-modal-intro">
                At <strong>KiranaGo</strong>, your account privacy and data security are our top priorities.
              </p>

              <div className="privacy-feature-list">
                <div className="privacy-feature-item">
                  <span className="privacy-feature-icon">🛡️</span>
                  <div>
                    <strong>Secure HTTP-Only Sessions</strong>
                    <p>Authentication tokens are stored in encrypted HTTP-Only cookies to protect against XSS and token theft.</p>
                  </div>
                </div>
                <div className="privacy-feature-item">
                  <span className="privacy-feature-icon">🔐</span>
                  <div>
                    <strong>Password Protection</strong>
                    <p>Your password is encrypted using Bcrypt hashing with random salt. Plaintext passwords are never stored.</p>
                  </div>
                </div>
                <div className="privacy-feature-item">
                  <span className="privacy-feature-icon">📦</span>
                  <div>
                    <strong>Strict User Data Isolation</strong>
                    <p>Your saved addresses, cart items, and order history are strictly isolated and private to your account only.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="privacy-modal-footer">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowPrivacyModal(false)}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile search row */}
      <div className="header__mobile-search">
        <div className="container">
          <form className="header__search header__search--mobile" onSubmit={handleSearchSubmit} role="search">
            <span className="header__search-icon" aria-hidden="true">🔍</span>
            <input
              id="mobile-search"
              type="search"
              className="header__search-input"
              placeholder="Search groceries..."
              value={searchQuery}
              onChange={handleSearch}
              autoComplete="off"
              aria-label="Search products"
            />
          </form>
        </div>
      </div>
    </header>
  );
}
