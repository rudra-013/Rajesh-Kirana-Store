/**
 * KiranaGo Frontend API Client
 * Connects React frontend seamlessly to Express backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Sends & receives HTTP-only cookies
  });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ── Auth APIs ──
export const authAPI = {
  signup: (payload) =>
    request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),

  getMe: () => request('/auth/me'),
};

// ── User APIs ──
export const userAPI = {
  getProfile: () => request('/users/profile'),
  updateProfile: (payload) =>
    request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
};

// ── Product APIs ──
export const productAPI = {
  getAll: (params = '') => request(`/products${params ? `?${params}` : ''}`),
  getById: (id) => request(`/products/${id}`),
  getByCategory: (category, subCategory = '') =>
    request(`/products/category/${category}${subCategory ? `?subCategory=${encodeURIComponent(subCategory)}` : ''}`),
  search: (query) => request(`/products/search?q=${encodeURIComponent(query)}`),
};

// ── Category APIs ──
export const categoryAPI = {
  getAll: () => request('/categories'),
  getById: (id) => request(`/categories/${id}`),
};

// ── Promo APIs ──
export const promoAPI = {
  getAll: () => request('/promos'),
  validate: (code, cartTotal) =>
    request('/promos/validate', {
      method: 'POST',
      body: JSON.stringify({ code, cartTotal }),
    }),
};

// ── Address APIs ──
export const addressAPI = {
  getAll: () => request('/addresses'),
  create: (addressData) =>
    request('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    }),
  update: (id, addressData) =>
    request(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    }),
  delete: (id) =>
    request(`/addresses/${id}`, {
      method: 'DELETE',
    }),
};

// ── Order APIs ──
export const orderAPI = {
  create: (orderData) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
  getAll: () => request('/orders'),
  getCurrent: () => request('/orders/current'),
  getById: (id) => request(`/orders/${id}`),
  cancel: (id) =>
    request(`/orders/${id}/cancel`, {
      method: 'POST',
    }),
};

export default {
  auth: authAPI,
  user: userAPI,
  products: productAPI,
  categories: categoryAPI,
  promos: promoAPI,
  addresses: addressAPI,
  orders: orderAPI,
};
