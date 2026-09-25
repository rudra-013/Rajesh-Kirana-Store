import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { userAPI } from '../services/api';
import './Profile.css';

export default function Profile() {
  const { user, logout, addresses, addAddress, editAddress, deleteAddress, availableCoupons, orders, currentOrder: serverCurrentOrder, cancelOrder } = useCart();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addrType, setAddrType] = useState('Home');
  const [addrText, setAddrText] = useState('');
  const [addrCity, setAddrCity] = useState('Ahmedabad, Gujarat');

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || 'Rudra Gharaliya');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'rudra@example.com');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '9876543210');

  useEffect(() => {
    if (user) {
      if (user.name) setProfileName(user.name);
      if (user.email) setProfileEmail(user.email);
      if (user.phone) setProfilePhone(user.phone);
    }
  }, [user]);

  // FAQ accordion state
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Parse backend orders or fallback to mock
  const mappedOrders = (orders && orders.length > 0)
    ? orders.map((ord) => ({
        id: ord.id,
        date: ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
        itemsCount: ord.items?.reduce((sum, item) => sum + (item.count || item.qty || 1), 0) || ord.items?.length || 1,
        itemsSummary: ord.itemsSummary || ord.items?.map((i) => i.name).join(', ') || 'Grocery items',
        amount: ord.finalTotal || ord.total || ord.subtotal || 0,
        status: ord.status || 'Delivered',
        rawStatus: ord.status,
      }))
    : [
        {
          id: '1002',
          date: 'Sep 22, 2026',
          itemsCount: 5,
          itemsSummary: 'Fresh Bananas, Amul Milk, Whole Wheat Bread, Tomatoes',
          amount: 480,
          status: 'Delivered',
        },
        {
          id: '1001',
          date: 'Sep 15, 2026',
          itemsCount: 2,
          itemsSummary: 'Aashirvaad Atta 5kg, Tata Salt',
          amount: 245,
          status: 'Delivered',
        },
      ];

  const previousOrders = mappedOrders;

  // Active current order
  const activeOrderFromList = orders?.find((o) =>
    ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(o.status)
  );
  const activeSource = serverCurrentOrder || activeOrderFromList;

  const getStepIndex = (status) => {
    switch (status) {
      case 'PLACED':
      case 'CONFIRMED':
        return 0;
      case 'PREPARING':
        return 1;
      case 'OUT_FOR_DELIVERY':
        return 2;
      case 'DELIVERED':
        return 3;
      default:
        return 0;
    }
  };

  const currentOrder = activeSource
    ? {
        id: activeSource.id,
        date: activeSource.createdAt
          ? new Date(activeSource.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          : 'Today',
        itemsCount: activeSource.items?.reduce((sum, item) => sum + (item.count || item.qty || 1), 0) || activeSource.items?.length || 1,
        itemsSummary: activeSource.itemsSummary || activeSource.items?.map((i) => i.name).join(', ') || 'Grocery items',
        amount: activeSource.finalTotal || activeSource.total || activeSource.subtotal || 0,
        eta: activeSource.eta || '10–15 mins',
        currentStep: getStepIndex(activeSource.status),
        steps: ['Order confirmed', 'Preparing', 'Out for delivery', 'Delivered'],
        rawStatus: activeSource.status,
      }
    : {
        id: '1003',
        date: 'Today, 3:45 PM',
        itemsCount: 3,
        itemsSummary: 'Farm Fresh Spinach, Onions 1kg, Brown Eggs',
        amount: 320,
        eta: '10–15 mins',
        currentStep: 2,
        steps: ['Order confirmed', 'Preparing', 'Out for delivery', 'Delivered'],
      };

  const faqs = [
    {
      q: 'How can I cancel my order?',
      a: 'You can cancel your order within 60 seconds of placing it from the Current Order section. Once the kirana partner starts packing, orders cannot be cancelled to prevent food waste.',
    },
    {
      q: 'How can I change my address?',
      a: 'Go to the Saved Addresses section in your Profile to add, edit, or set default delivery addresses before placing an order.',
    },
    {
      q: 'How can I use a promo code?',
      a: 'Open your Cart, type or select any eligible coupon code under the "Have a promo code?" section, and click Apply. The discount will instantly reflect in your total.',
    },
    {
      q: 'How long does delivery take?',
      a: 'Our local partner kirana network delivers most orders within 10 to 20 minutes depending on your distance and current traffic.',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await userAPI.updateProfile({
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
      });
    } catch (err) {
      // Ignored for UI responsiveness
    }
    setIsEditingProfile(false);
  };

  const handleStartAddAddress = () => {
    setEditingAddressId(null);
    setAddrType('Home');
    setAddrText('');
    setAddrCity('Ahmedabad, Gujarat');
    setShowAddressForm(true);
  };

  const handleStartEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddrType(addr.type);
    setAddrText(addr.address);
    setAddrCity(addr.city);
    setShowAddressForm(true);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!addrText.trim()) return;

    if (editingAddressId) {
      editAddress(editingAddressId, {
        type: addrType,
        address: addrText,
        city: addrCity,
      });
    } else {
      addAddress({
        type: addrType,
        address: addrText,
        city: addrCity,
      });
    }
    setShowAddressForm(false);
    setEditingAddressId(null);
  };

  // If user is not logged in
  if (!user) {
    return (
      <main className="page-content profile-page">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state__icon">👤</div>
            <h1 className="empty-state__title">You are not logged in</h1>
            <p className="empty-state__subtitle">
              Please log in to view your profile, active orders, and saved addresses.
            </p>
            <Link to="/login" className="btn btn-primary btn-lg">
              Log In Now
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-content profile-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/" className="breadcrumb__link">Home</Link>
          <span className="breadcrumb__sep">›</span>
          <span className="breadcrumb__current">My Account</span>
        </nav>

        <div className="profile-layout">
          {/* Navigation Sidebar */}
          <aside className="profile-nav" aria-label="Profile menu">
            <div className="profile-user-card">
              <div className="profile-user-avatar">👤</div>
              <div className="profile-user-meta">
                <p className="profile-user-name">{profileName}</p>
                <p className="profile-user-phone">+91 {profilePhone}</p>
              </div>
            </div>

            <nav className="profile-menu">
              <button
                className={`profile-menu__item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <span>👤</span> My Profile
              </button>
              <button
                className={`profile-menu__item ${activeTab === 'current-order' ? 'active' : ''}`}
                onClick={() => setActiveTab('current-order')}
              >
                <span>🛵</span> Current Order
              </button>
              <button
                className={`profile-menu__item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <span>📦</span> My Orders
              </button>
              <button
                className={`profile-menu__item ${activeTab === 'addresses' ? 'active' : ''}`}
                onClick={() => setActiveTab('addresses')}
              >
                <span>📍</span> Saved Addresses
              </button>
              <button
                className={`profile-menu__item ${activeTab === 'coupons' ? 'active' : ''}`}
                onClick={() => setActiveTab('coupons')}
              >
                <span>🏷️</span> Available Coupons
              </button>
              <button
                className={`profile-menu__item ${activeTab === 'faq' ? 'active' : ''}`}
                onClick={() => setActiveTab('faq')}
              >
                <span>❓</span> FAQs
              </button>
              <button
                className="profile-menu__item profile-menu__item--logout"
                onClick={handleLogout}
              >
                <span>🚪</span> Log Out
              </button>
            </nav>
          </aside>

          {/* Tab Content Panel */}
          <section className="profile-content" aria-labelledby="tab-heading">
            {/* 1. My Profile Tab */}
            {activeTab === 'profile' && (
              <div className="profile-section">
                <div className="profile-section__header">
                  <h2 className="profile-section__title" id="tab-heading">My Profile</h2>
                  {!isEditingProfile && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                {isEditingProfile ? (
                  <form className="profile-form" onSubmit={handleSaveProfile}>
                    <div className="profile-field">
                      <label className="profile-label">Full Name</label>
                      <input
                        type="text"
                        className="profile-input"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="profile-field">
                      <label className="profile-label">Mobile Number</label>
                      <input
                        type="tel"
                        className="profile-input"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="profile-field">
                      <label className="profile-label">Email Address</label>
                      <input
                        type="email"
                        className="profile-input"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="profile-form__actions">
                      <button type="submit" className="btn btn-primary btn-sm">
                        Save Changes
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setIsEditingProfile(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="profile-info-list">
                    <div className="profile-info-row">
                      <span className="profile-info-label">Full Name</span>
                      <span className="profile-info-val">{profileName}</span>
                    </div>
                    <div className="profile-info-row">
                      <span className="profile-info-label">Mobile Number</span>
                      <span className="profile-info-val">+91 {profilePhone}</span>
                    </div>
                    <div className="profile-info-row">
                      <span className="profile-info-label">Email Address</span>
                      <span className="profile-info-val">{profileEmail}</span>
                    </div>
                    <div className="profile-info-row">
                      <span className="profile-info-label">Membership</span>
                      <span className="badge badge-success">KiranaGo Member</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Current Order Tab */}
            {activeTab === 'current-order' && (
              <div className="profile-section">
                <div className="profile-section__header">
                  <h2 className="profile-section__title" id="tab-heading">Current Order</h2>
                  <span className="badge badge-warning">In Progress</span>
                </div>

                <div className="current-order-card">
                  <div className="current-order-header">
                    <div>
                      <h3 className="current-order-id">Order #{currentOrder.id}</h3>
                      <p className="current-order-date">{currentOrder.date} • {currentOrder.itemsCount} items</p>
                    </div>
                    <div className="current-order-eta">
                      <span className="current-order-eta-label">Estimated Delivery</span>
                      <span className="current-order-eta-time">⚡ {currentOrder.eta}</span>
                    </div>
                  </div>

                  <p className="current-order-summary">{currentOrder.itemsSummary}</p>
                  <p className="current-order-amount">Total: <strong>₹{currentOrder.amount}</strong></p>

                  <div className="divider" />

                  {/* Clean Order Status Progress */}
                  <h4 className="tracker-heading">Order Status</h4>
                  <div className="status-tracker">
                    {currentOrder.steps.map((step, idx) => (
                      <div
                        key={step}
                        className={`status-step ${
                          idx < currentOrder.currentStep
                            ? 'completed'
                            : idx === currentOrder.currentStep
                            ? 'active'
                            : ''
                        }`}
                      >
                        <div className="status-step__dot">
                          {idx < currentOrder.currentStep ? '✓' : idx + 1}
                        </div>
                        <span className="status-step__label">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. My Orders Tab */}
            {activeTab === 'orders' && (
              <div className="profile-section">
                <div className="profile-section__header">
                  <h2 className="profile-section__title" id="tab-heading">My Orders</h2>
                </div>

                <div className="orders-list">
                  {previousOrders.map((ord) => (
                    <div key={ord.id} className="order-row">
                      <div className="order-row__main">
                        <div className="order-row__top">
                          <span className="order-row__id">Order #{ord.id}</span>
                          <span className="badge badge-success">{ord.status}</span>
                        </div>
                        <p className="order-row__items">{ord.itemsCount} items • {ord.itemsSummary}</p>
                        <p className="order-row__date">{ord.date}</p>
                      </div>
                      <div className="order-row__price">
                        <span className="order-row__amount">₹{ord.amount}</span>
                        <span className="order-row__paid">Paid online</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Saved Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="profile-section">
                <div className="profile-section__header">
                  <h2 className="profile-section__title" id="tab-heading">Saved Addresses</h2>
                  {!showAddressForm && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleStartAddAddress}
                    >
                      + Add Address
                    </button>
                  )}
                </div>

                {showAddressForm && (
                  <form className="address-form" onSubmit={handleSaveAddress}>
                    <h3 className="address-form__title">
                      {editingAddressId ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <div className="address-form__types">
                      {['Home', 'Work', 'Other'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={`address-type-btn ${addrType === t ? 'active' : ''}`}
                          onClick={() => setAddrType(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    <div className="profile-field">
                      <label className="profile-label">Street / House / Flat No.</label>
                      <input
                        type="text"
                        className="profile-input"
                        placeholder="e.g. B-402, Shivalik Heights, Bodakdev"
                        value={addrText}
                        onChange={(e) => setAddrText(e.target.value)}
                        required
                      />
                    </div>

                    <div className="profile-field">
                      <label className="profile-label">City, State & Pincode</label>
                      <input
                        type="text"
                        className="profile-input"
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        required
                      />
                    </div>

                    <div className="profile-form__actions">
                      <button type="submit" className="btn btn-primary btn-sm">
                        Save Address
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setShowAddressForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="addresses-list">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="address-row">
                      <div className="address-row__meta">
                        <div className="address-row__header">
                          <span className="address-row__type">{addr.type}</span>
                        </div>
                        <p className="address-row__text">{addr.address}</p>
                        <p className="address-row__city">{addr.city}</p>
                      </div>
                      <div className="address-row__actions">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleStartEditAddress(addr)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-ghost btn-sm text-muted"
                          onClick={() => deleteAddress(addr.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Available Coupons Tab */}
            {activeTab === 'coupons' && (
              <div className="profile-section">
                <div className="profile-section__header">
                  <h2 className="profile-section__title" id="tab-heading">Available Coupons</h2>
                </div>

                <div className="profile-coupons-grid">
                  {availableCoupons.map((c) => (
                    <div key={c.code} className="profile-coupon-card">
                      <div className="profile-coupon-header">
                        <span className="profile-coupon-code">{c.code}</span>
                        <span className="profile-coupon-tag">Active</span>
                      </div>
                      <h3 className="profile-coupon-title">{c.title}</h3>
                      <p className="profile-coupon-desc">{c.description}</p>
                      <div className="profile-coupon-footer">
                        <span className="profile-coupon-min">Min order: ₹{c.minOrder}</span>
                        <Link to="/" className="btn btn-outline btn-sm">
                          Shop Now
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. FAQs Tab */}
            {activeTab === 'faq' && (
              <div className="profile-section">
                <div className="profile-section__header">
                  <h2 className="profile-section__title" id="tab-heading">
                    Frequently Asked Questions
                  </h2>
                </div>

                <div className="faq-list">
                  {faqs.map((faq, index) => {
                    const isOpen = expandedFaq === index;
                    return (
                      <div
                        key={faq.q}
                        className={`faq-item ${isOpen ? 'open' : ''}`}
                      >
                        <button
                          type="button"
                          className="faq-question"
                          onClick={() => setExpandedFaq(isOpen ? null : index)}
                          aria-expanded={isOpen}
                        >
                          <span>{faq.q}</span>
                          <span className="faq-chevron">{isOpen ? '−' : '+'}</span>
                        </button>
                        {isOpen && <div className="faq-answer"><p>{faq.a}</p></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
