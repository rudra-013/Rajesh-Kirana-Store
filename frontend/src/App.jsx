import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Category from './pages/Category';
import ProductDetail from './pages/ProductDetail';
import SearchResults from './pages/SearchResults';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <CartProvider>
        <Header />
        <CartDrawer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:category" element={<Category />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <main className="page-content">
                <div className="container">
                  <div className="empty-state" style={{ paddingTop: 'var(--space-16)' }}>
                    <div className="empty-state__icon">🔍</div>
                    <h2 className="empty-state__title">Page not found</h2>
                    <p className="empty-state__subtitle">
                      The page you're looking for doesn't exist.
                    </p>
                    <a href="/" className="btn btn-primary">Back to Home</a>
                  </div>
                </div>
              </main>
            }
          />
        </Routes>
        <Footer />
      </CartProvider>
    </BrowserRouter>
  );
}
