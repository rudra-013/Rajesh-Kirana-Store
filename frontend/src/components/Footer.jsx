import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <span>🛒</span>
              <span>Kirana<span style={{ color: 'var(--color-primary)' }}>Go</span></span>
            </Link>
            <p className="footer__tagline">
              Fresh groceries delivered to your doorstep in minutes.
            </p>
            <p className="footer__copyright">
              &copy; {new Date().getFullYear()} KiranaGo. Frontend UI prototype.
            </p>
          </div>

          {/* Links */}
          <div className="footer__links-group">
            <h4 className="footer__links-title">Company</h4>
            <ul className="footer__links">
              <li><a href="#" className="footer__link">About Us</a></li>
              <li><a href="#" className="footer__link">Careers</a></li>
              <li><a href="#" className="footer__link">Blog</a></li>
              <li><a href="#" className="footer__link">Press</a></li>
            </ul>
          </div>

          <div className="footer__links-group">
            <h4 className="footer__links-title">Help</h4>
            <ul className="footer__links">
              <li><a href="#" className="footer__link">FAQ</a></li>
              <li><a href="#" className="footer__link">Track Order</a></li>
              <li><a href="#" className="footer__link">Return Policy</a></li>
              <li><a href="#" className="footer__link">Contact Us</a></li>
            </ul>
          </div>

          <div className="footer__links-group">
            <h4 className="footer__links-title">Categories</h4>
            <ul className="footer__links">
              <li><Link to="/category/fruits-vegetables" className="footer__link">Fruits & Veggies</Link></li>
              <li><Link to="/category/dairy-breakfast" className="footer__link">Dairy & Breakfast</Link></li>
              <li><Link to="/category/snacks" className="footer__link">Snacks</Link></li>
              <li><Link to="/category/beverages" className="footer__link">Beverages</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__legal">
            This is a frontend UI prototype. No real orders, payments, or accounts are processed.
          </p>
        </div>
      </div>
    </footer>
  );
}
