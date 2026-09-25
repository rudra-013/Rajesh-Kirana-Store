import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { searchProducts } from '../data/products';
import './Header.css';

export default function Header() {
  const { totalItems, openCart, user } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [location, setLocation] = useState('Ahmedabad, Gujarat');
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
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

        {/* Right: Login/Profile + Cart */}
        <div className="header__right">
          {user ? (
            <Link to="/profile" className="header__login" aria-label="My Profile">
              <span className="header__login-icon">👤</span>
              <span className="header__login-text">Profile</span>
            </Link>
          ) : (
            <Link to="/login" className="header__login" aria-label="Login to your account">
              <span className="header__login-icon">👤</span>
              <span className="header__login-text">Login</span>
            </Link>
          )}

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
