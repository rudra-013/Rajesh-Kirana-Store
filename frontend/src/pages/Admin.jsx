import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import './Admin.css';

export default function Admin() {
  const { adminBargains, fetchAdminBargains, acceptBargainRequest, rejectBargainRequest, orders } = useCart();
  const [activeTab, setActiveTab] = useState('bargains');
  const [statusFilter, setStatusFilter] = useState('All');

  // Response prompt state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(null); // 'accept' | 'reject'
  const [adminResponse, setAdminResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchAdminBargains();
  }, [fetchAdminBargains]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleOpenActionModal = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setAdminResponse(
      type === 'accept'
        ? `Offer accepted! You can now purchase ${request.productName} at ₹${request.proposedPrice}.`
        : `Sorry, we cannot offer this price at the moment. Minimum possible price is ₹${Math.round(request.originalPrice * 0.95)}.`
    );
  };

  const handleConfirmAction = async (e) => {
    e.preventDefault();
    if (!selectedRequest || !actionType) return;

    setIsProcessing(true);
    try {
      if (actionType === 'accept') {
        await acceptBargainRequest(selectedRequest.id, adminResponse);
        showToast(`✅ Bargain request accepted for ${selectedRequest.customerName}!`);
      } else {
        await rejectBargainRequest(selectedRequest.id, adminResponse);
        showToast(`🔴 Bargain request rejected.`);
      }
      setSelectedRequest(null);
      setActionType(null);
      setAdminResponse('');
    } catch (err) {
      showToast(`⚠️ Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredBargains = adminBargains.filter((b) => {
    if (statusFilter === 'All') return true;
    return b.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const pendingCount = adminBargains.filter((b) => b.status === 'Pending').length;
  const acceptedCount = adminBargains.filter((b) => b.status === 'Accepted').length;
  const rejectedCount = adminBargains.filter((b) => b.status === 'Rejected').length;

  return (
    <main className="page-content admin-page">
      <div className="container">
        {toastMessage && <div className="admin-toast-banner">{toastMessage}</div>}

        <div className="admin-header">
          <div>
            <span className="badge badge-success">KiranaGo Admin Panel</span>
            <h1 className="admin-title">Store Management Dashboard</h1>
          </div>
          <button className="btn btn-outline btn-sm" onClick={fetchAdminBargains}>
            ↻ Sync Data
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button
            className={`admin-tab-btn ${activeTab === 'bargains' ? 'active' : ''}`}
            onClick={() => setActiveTab('bargains')}
          >
            🤝 Price Negotiation Requests
            {pendingCount > 0 && <span className="badge badge-warning">{pendingCount} Pending</span>}
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Customer Orders ({orders?.length || 0})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            🛒 Store Inventory ({products?.length || 0})
          </button>
        </div>

        {/* TAB 1: PRICE NEGOTIATION REQUESTS */}
        {activeTab === 'bargains' && (
          <div className="admin-section">
            <div className="admin-filters-bar">
              <div className="admin-filter-group">
                <span className="admin-filter-label">Filter by Status:</span>
                {['All', 'Pending', 'Accepted', 'Rejected', 'Expired'].map((st) => (
                  <button
                    key={st}
                    className={`admin-filter-chip ${statusFilter === st ? 'active' : ''}`}
                    onClick={() => setStatusFilter(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
              <div className="admin-stats-pills">
                <span className="stat-pill pending">⏳ {pendingCount} Pending</span>
                <span className="stat-pill accepted">✓ {acceptedCount} Accepted</span>
                <span className="stat-pill rejected">✕ {rejectedCount} Rejected</span>
              </div>
            </div>

            {filteredBargains.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-state__icon">🤝</div>
                <h3 className="empty-state__title">No Bargaining Requests Found</h3>
                <p className="empty-state__subtitle">
                  {statusFilter === 'All'
                    ? 'No customer price negotiation requests submitted yet.'
                    : `No bargain requests with status '${statusFilter}'.`}
                </p>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Customer Details</th>
                      <th>Product</th>
                      <th>Original Price</th>
                      <th>Proposed Offer</th>
                      <th>Discount Requested</th>
                      <th>Customer Note</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBargains.map((req) => {
                      const discountVal = req.originalPrice - req.proposedPrice;
                      const discountPct = Math.round((discountVal / req.originalPrice) * 100);
                      const isPending = req.status === 'Pending';
                      const isAccepted = req.status === 'Accepted';
                      const isRejected = req.status === 'Rejected';

                      return (
                        <tr key={req.id} className={`admin-tr--${req.status.toLowerCase()}`}>
                          <td>
                            <div className="admin-customer-info">
                              <span className="admin-customer-name">{req.customerName}</span>
                              <span className="admin-customer-id">ID: {req.customerId}</span>
                              <span className="admin-customer-phone">📞 {req.customerPhone}</span>
                            </div>
                          </td>
                          <td>
                            <div className="admin-product-cell">
                              <span className="admin-product-emoji">{req.productImage || '📦'}</span>
                              <div>
                                <span className="admin-product-name">{req.productName}</span>
                                <span className="admin-product-unit">Unit: {req.productQuantity} • Qty: {req.quantity}</span>
                              </div>
                            </div>
                          </td>
                          <td className="admin-price-cell line-through">
                            ₹{req.originalPrice}
                          </td>
                          <td className="admin-price-cell offer-highlight">
                            ₹{req.proposedPrice}
                          </td>
                          <td>
                            <span className="badge badge-success">
                              Save ₹{discountVal} ({discountPct}% off)
                            </span>
                          </td>
                          <td className="admin-msg-cell">
                            {req.customerMessage ? `"${req.customerMessage}"` : <span className="text-muted">—</span>}
                          </td>
                          <td>
                            <span
                              className={`badge badge-${
                                isAccepted ? 'success' : isPending ? 'warning' : isRejected ? 'danger' : 'secondary'
                              }`}
                            >
                              {req.status}
                            </span>
                          </td>
                          <td>
                            {isPending ? (
                              <div className="admin-action-btns">
                                <button
                                  className="btn btn-primary btn-sm admin-btn-accept"
                                  onClick={() => handleOpenActionModal(req, 'accept')}
                                >
                                  ✓ Accept
                                </button>
                                <button
                                  className="btn btn-outline btn-sm admin-btn-reject"
                                  onClick={() => handleOpenActionModal(req, 'reject')}
                                >
                                  ✕ Reject
                                </button>
                              </div>
                            ) : (
                              <div className="admin-processed-info">
                                <span className="admin-res-text">{req.adminResponse || req.status}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STORE ORDERS */}
        {activeTab === 'orders' && (
          <div className="admin-section">
            <h3 className="admin-section-title">Store Orders History</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders && orders.length > 0 ? (
                    orders.map((ord) => (
                      <tr key={ord.id}>
                        <td><strong>#{ord.id}</strong></td>
                        <td>{ord.userId || 'Customer'}</td>
                        <td>{ord.items?.length || 1} items</td>
                        <td><strong>₹{ord.finalTotal || ord.total || 0}</strong></td>
                        <td>{ord.paymentMethod || 'UPI'}</td>
                        <td><span className="badge badge-success">{ord.status}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>No orders recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: INVENTORY */}
        {activeTab === 'products' && (
          <div className="admin-section">
            <h3 className="admin-section-title">Store Inventory & Normal Product Prices</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Unit Size</th>
                    <th>Standard Price</th>
                    <th>MRP</th>
                    <th>Discount</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="admin-product-cell">
                          <span>{p.emoji}</span>
                          <strong>{p.name}</strong>
                        </div>
                      </td>
                      <td>{p.categoryName}</td>
                      <td>{p.quantity}</td>
                      <td><strong>₹{p.price}</strong></td>
                      <td className="line-through">₹{p.mrp}</td>
                      <td>{p.discount}% off</td>
                      <td><span className="badge badge-success">{p.stock} units</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Prompt Modal */}
        {selectedRequest && (
          <div className="admin-modal-overlay" onClick={() => setSelectedRequest(null)}>
            <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>
                  {actionType === 'accept' ? '🟢 Accept Price Request' : '🔴 Reject Price Request'}
                </h3>
                <button className="admin-modal-close" onClick={() => setSelectedRequest(null)}>✕</button>
              </div>

              <form onSubmit={handleConfirmAction} className="admin-modal-body">
                <div className="admin-request-summary">
                  <p><strong>Customer:</strong> {selectedRequest.customerName} ({selectedRequest.customerPhone})</p>
                  <p><strong>Product:</strong> {selectedRequest.productName}</p>
                  <p><strong>Original Price:</strong> ₹{selectedRequest.originalPrice} ➔ <strong>Proposed Offer: ₹{selectedRequest.proposedPrice}</strong></p>
                </div>

                <div className="admin-form-group">
                  <label>Message / Response to Customer</label>
                  <textarea
                    className="admin-textarea"
                    rows="3"
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    required
                  />
                </div>

                <div className="admin-modal-footer">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setSelectedRequest(null)}
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn ${actionType === 'accept' ? 'btn-primary' : 'btn-outline'}`}
                    disabled={isProcessing}
                  >
                    {isProcessing
                      ? 'Processing...'
                      : actionType === 'accept'
                      ? 'Confirm Accept'
                      : 'Confirm Reject'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
