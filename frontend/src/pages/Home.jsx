import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import LoginModal from '../components/LoginModal';
import { categories } from '../data/categories';
import { useCart } from '../context/CartContext';
import './Home.css';

export default function Home() {
  const { user } = useCart();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // If not logged in and hasn't dismissed yet, show login upfront
    const dismissed = sessionStorage.getItem('kiranago_login_prompted');
    if (!user && !dismissed) {
      setShowLoginModal(true);
      sessionStorage.setItem('kiranago_login_prompted', 'true');
    }
  }, [user]);

  return (
    <main className="page-content home-page-photo">
      {/* Upfront Login / Sign-in Modal */}
      <LoginModal
        isOpen={showLoginModal && !user}
        onClose={() => setShowLoginModal(false)}
      />

      <div className="container">
        {/* ── 1. Top Wide Hero Banner (Like Photo) ── */}
        <section className="essentials-hero-banner" aria-label="Daily Essentials Promotion">
          <div className="essentials-hero-banner__content">
            <h1 className="essentials-hero-banner__title">
              Stock up on daily essentials
            </h1>
            <p className="essentials-hero-banner__desc">
              Get farm-fresh goodness & a range of exotic fruits, vegetables, eggs & more
            </p>
            <Link
              to="/category/fruits-vegetables"
              className="essentials-hero-banner__btn"
              aria-label="Shop daily essentials"
            >
              Shop Now
            </Link>
          </div>

          <div className="essentials-hero-banner__visual" aria-hidden="true">
            <div className="essentials-hero-banner__composition">
              <span className="hero-emoji hero-emoji--milk">🥛</span>
              <span className="hero-emoji hero-emoji--eggs">🥚</span>
              <span className="hero-emoji hero-emoji--banana">🍌</span>
              <span className="hero-emoji hero-emoji--apple">🍎</span>
              <span className="hero-emoji hero-emoji--veg">🥦</span>
              <span className="hero-emoji hero-emoji--tomato">🍅</span>
              <span className="hero-emoji hero-emoji--capsicum">🫑</span>
            </div>
          </div>
        </section>

        {/* ── 2. Row of 3 Promo Cards (Pharmacy, Pet Care, Baby Care Like Photo) ── */}
        <section className="promo-cards-row" aria-label="Quick Category Highlights">
          {/* Card 1: Pharmacy */}
          <div className="photo-promo-card photo-promo-card--pharma">
            <div className="photo-promo-card__text">
              <h2 className="photo-promo-card__title">
                Pharmacy at<br />your doorstep!
              </h2>
              <p className="photo-promo-card__sub">
                Cough syrups, pain<br />relief sprays & more
              </p>
              <Link to="/category/pharma-wellness" className="photo-promo-card__btn">
                Order Now
              </Link>
            </div>
            <div className="photo-promo-card__visual" aria-hidden="true">
              <span className="promo-emoji promo-emoji--main">💊</span>
              <span className="promo-emoji promo-emoji--sub">🩹</span>
            </div>
          </div>

          {/* Card 2: Pet Care */}
          <div className="photo-promo-card photo-promo-card--pet">
            <div className="photo-promo-card__text">
              <h2 className="photo-promo-card__title">
                Pet care supplies<br />at your door
              </h2>
              <p className="photo-promo-card__sub">
                Food, treats, toys & more
              </p>
              <Link to="/category/pet-care" className="photo-promo-card__btn">
                Order Now
              </Link>
            </div>
            <div className="photo-promo-card__visual" aria-hidden="true">
              <span className="promo-emoji promo-emoji--main">🐕</span>
              <span className="promo-emoji promo-emoji--sub">🐱</span>
            </div>
          </div>

          {/* Card 3: Baby Care */}
          <div className="photo-promo-card photo-promo-card--baby">
            <div className="photo-promo-card__text">
              <h2 className="photo-promo-card__title">
                No time for<br />a diaper run?
              </h2>
              <p className="photo-promo-card__sub">
                Get baby care essentials
              </p>
              <Link to="/category/baby-care" className="photo-promo-card__btn">
                Order Now
              </Link>
            </div>
            <div className="photo-promo-card__visual" aria-hidden="true">
              <span className="promo-emoji promo-emoji--main">👶</span>
              <span className="promo-emoji promo-emoji--sub">🍼</span>
            </div>
          </div>
        </section>

        {/* ── 3. Category Grid (Exact 10 per row like Photo) ── */}
        <section className="photo-categories-section" aria-label="Browse by Category">
          <div className="photo-categories-grid">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
