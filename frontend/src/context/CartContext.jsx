import { createContext, useContext, useReducer, useState, useEffect, useCallback } from 'react';
import { authAPI, addressAPI, promoAPI, orderAPI } from '../services/api.js';

const CartContext = createContext(null);

export const AVAILABLE_COUPONS = [
  {
    code: 'SAVE50',
    title: '₹50 off on orders above ₹499',
    description: 'Use code SAVE50 to get flat ₹50 discount',
    minOrder: 499,
    discountType: 'flat',
    discountValue: 50,
  },
  {
    code: 'WELCOME10',
    title: '10% off on eligible orders',
    description: 'Get 10% off on your order up to ₹100',
    minOrder: 150,
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 100,
  },
  {
    code: 'FRESH10',
    title: 'Extra 10% off on fresh kirana',
    description: 'Fresh kirana produce discount up to ₹100',
    minOrder: 100,
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 100,
  },
];

const INITIAL_ADDRESSES = [
  {
    id: 'address_1',
    label: 'Home',
    type: 'Home',
    tag: 'Default',
    address: 'B-402, Shivalik Heights, Bodakdev',
    city: 'Ahmedabad, Gujarat 380054',
    pincode: '380054',
  },
  {
    id: 'address_2',
    label: 'Work',
    type: 'Work',
    tag: 'Office',
    address: 'Floor 3, Tech Park, SG Highway',
    city: 'Ahmedabad, Gujarat 380015',
    pincode: '380015',
  },
];

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => String(i.id) === String(action.payload.id));
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            String(i.id) === String(action.payload.id) ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, qty: 1 }],
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((i) => String(i.id) !== String(action.payload)),
      };

    case 'INCREMENT':
      return {
        ...state,
        items: state.items.map((i) =>
          String(i.id) === String(action.payload) ? { ...i, qty: i.qty + 1 } : i
        ),
      };

    case 'DECREMENT': {
      const item = state.items.find((i) => String(i.id) === String(action.payload));
      if (!item) return state;
      if (item.qty === 1) {
        return {
          ...state,
          items: state.items.filter((i) => String(i.id) !== String(action.payload)),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          String(i.id) === String(action.payload) ? { ...i, qty: i.qty - 1 } : i
        ),
      };
    }

    case 'CLEAR_CART':
      return { ...state, items: [] };

    case 'OPEN_CART':
      return { ...state, isOpen: true };

    case 'CLOSE_CART':
      return { ...state, isOpen: false };

    default:
      return state;
  }
};

const initialCartState = {
  items: [],
  isOpen: false,
};

export function CartProvider({ children }) {
  const [cartState, dispatch] = useReducer(cartReducer, initialCartState);

  // Authentication State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kiranago_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Verify auth on mount via /api/auth/me
  useEffect(() => {
    let isMounted = true;
    authAPI
      .getMe()
      .then((res) => {
        if (isMounted && res?.data) {
          setUser(res.data);
          localStorage.setItem('kiranago_user', JSON.stringify(res.data));
        }
      })
      .catch(() => {
        // Not authenticated or session expired
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (userDataOrCredentials) => {
    try {
      // If credentials object passed (e.g. { email/phone, password })
      if (
        userDataOrCredentials?.password ||
        userDataOrCredentials?.identifier ||
        (userDataOrCredentials?.phone && !userDataOrCredentials?.email)
      ) {
        const payload = {
          identifier:
            userDataOrCredentials.identifier ||
            userDataOrCredentials.phone ||
            userDataOrCredentials.email ||
            'rudra@example.com',
          password: userDataOrCredentials.password || 'password123',
        };
        const res = await authAPI.login(payload);
        if (res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('kiranago_user', JSON.stringify(res.data.user));
          fetchAddresses();
          fetchOrders();
          return res.data.user;
        }
      }

      // Default mock login fallback
      const userObj = {
        id: userDataOrCredentials?.id || 'user_1',
        name: userDataOrCredentials?.name || 'Rudra Gharaliya',
        phone: userDataOrCredentials?.phone || '9876543210',
        email: userDataOrCredentials?.email || 'rudra@example.com',
        preferredLanguage: userDataOrCredentials?.preferredLanguage || 'en',
      };
      setUser(userObj);
      localStorage.setItem('kiranago_user', JSON.stringify(userObj));
      return userObj;
    } catch (err) {
      console.warn('Backend login attempt:', err.message);
      // Fallback to local user
      const userObj = {
        name: userDataOrCredentials?.name || 'Rudra Gharaliya',
        phone: userDataOrCredentials?.phone || '9876543210',
        email: userDataOrCredentials?.email || 'rudra@example.com',
      };
      setUser(userObj);
      localStorage.setItem('kiranago_user', JSON.stringify(userObj));
      return userObj;
    }
  };

  const signup = async (signupData) => {
    try {
      const res = await authAPI.signup(signupData);
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('kiranago_user', JSON.stringify(res.data.user));
        return res.data.user;
      }
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      // Ignore network errors on logout
    }
    setUser(null);
    localStorage.removeItem('kiranago_user');
    setAddresses(INITIAL_ADDRESSES);
    setOrders([]);
    setCurrentOrder(null);
  };

  // Addresses State
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('kiranago_addresses');
      return saved ? JSON.parse(saved) : INITIAL_ADDRESSES;
    } catch {
      return INITIAL_ADDRESSES;
    }
  });

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await addressAPI.getAll();
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setAddresses(res.data);
      }
    } catch (err) {
      // Fallback to local
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user, fetchAddresses]);

  useEffect(() => {
    localStorage.setItem('kiranago_addresses', JSON.stringify(addresses));
  }, [addresses]);

  const addAddress = async (newAddr) => {
    try {
      const res = await addressAPI.create({
        type: newAddr.type || 'Home',
        label: newAddr.label || newAddr.type || 'Home',
        tag: newAddr.tag || '',
        address: newAddr.address,
        city: newAddr.city || 'Ahmedabad, Gujarat',
        pincode: newAddr.pincode || '380054',
      });
      if (res?.data) {
        setAddresses((prev) => [...prev, res.data]);
        return res.data;
      }
    } catch (err) {
      // Fallback local creation
    }

    const addressItem = {
      id: `address_${Date.now()}`,
      type: newAddr.type || 'Other',
      label: newAddr.label || newAddr.type || 'Other',
      tag: newAddr.tag || '',
      address: newAddr.address,
      city: newAddr.city || 'Ahmedabad, Gujarat',
    };
    setAddresses((prev) => [...prev, addressItem]);
    return addressItem;
  };

  const editAddress = async (id, updated) => {
    try {
      const res = await addressAPI.update(id, updated);
      if (res?.data) {
        setAddresses((prev) => prev.map((a) => (a.id === id ? res.data : a)));
        return;
      }
    } catch (err) {
      // Fallback local update
    }
    setAddresses((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
    );
  };

  const deleteAddress = async (id) => {
    try {
      await addressAPI.delete(id);
    } catch (err) {
      // Fallback local deletion
    }
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  // Promo Code State
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [serverPromoDiscount, setServerPromoDiscount] = useState(0);

  const subtotal = cartState.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalItems = cartState.items.reduce((sum, i) => sum + i.qty, 0);

  // Calculate Promo Discount
  let promoDiscount = serverPromoDiscount;
  if (appliedPromo && !serverPromoDiscount) {
    const coupon = AVAILABLE_COUPONS.find(
      (c) => c.code.toUpperCase() === appliedPromo.toUpperCase()
    );
    if (coupon) {
      if (subtotal >= coupon.minOrder) {
        if (coupon.discountType === 'flat') {
          promoDiscount = coupon.discountValue;
        } else if (coupon.discountType === 'percentage') {
          const calculated = Math.round((subtotal * coupon.discountValue) / 100);
          promoDiscount = coupon.maxDiscount
            ? Math.min(calculated, coupon.maxDiscount)
            : calculated;
        }
      }
    }
  }

  // Delivery Fee calculation
  const deliveryFee = subtotal === 0 ? 0 : subtotal >= 500 ? 0 : 30;

  // Final Total calculation
  const total = Math.max(0, subtotal - promoDiscount + deliveryFee);

  const applyPromo = async (inputCode) => {
    const code = inputCode.trim().toUpperCase();

    // Validate with backend API
    try {
      const res = await promoAPI.validate(code, subtotal);
      if (res?.data && res.data.valid) {
        setAppliedPromo(code);
        setServerPromoDiscount(res.data.discount || 0);
        return { success: true, message: res.data.message || `Coupon ${code} applied!` };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Invalid promo code.' };
    }

    // Fallback local check
    const coupon = AVAILABLE_COUPONS.find((c) => c.code === code);
    if (!coupon) {
      return { success: false, message: 'Invalid promo code. Try SAVE50 or FRESH10.' };
    }
    if (subtotal < coupon.minOrder) {
      return {
        success: false,
        message: `${coupon.code} requires a minimum order of ₹${coupon.minOrder}.`,
      };
    }
    setAppliedPromo(code);
    return { success: true, message: `Coupon ${code} applied successfully!` };
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setServerPromoDiscount(0);
  };

  // Orders State & API connection
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await orderAPI.getAll();
      if (res?.data) {
        setOrders(res.data);
      }
    } catch (err) {
      // Fallback
    }
  }, []);

  const fetchCurrentOrder = useCallback(async () => {
    try {
      const res = await orderAPI.getCurrent();
      if (res?.data) {
        setCurrentOrder(res.data);
      }
    } catch (err) {
      // Fallback
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchCurrentOrder();
    }
  }, [user, fetchOrders, fetchCurrentOrder]);

  const createOrder = async (orderPayload) => {
    const payload = {
      items: cartState.items.map((i) => ({
        id: i.id,
        quantity: i.qty,
      })),
      addressId: orderPayload?.addressId,
      address: orderPayload?.address,
      promoCode: appliedPromo,
      paymentMethod: orderPayload?.paymentMethod || 'UPI',
    };

    try {
      const res = await orderAPI.create(payload);
      if (res?.data) {
        clearCart();
        fetchOrders();
        fetchCurrentOrder();
        return res.data;
      }
    } catch (err) {
      console.warn('Backend order placement error, falling back locally:', err.message);
    }

    // Local fallback order
    const localOrder = {
      id: String(Date.now()).slice(-4),
      items: [...cartState.items],
      total,
      status: 'CONFIRMED',
      createdAt: new Date(),
    };
    clearCart();
    return localOrder;
  };

  const cancelOrder = async (orderId) => {
    try {
      const res = await orderAPI.cancel(orderId);
      if (res?.data) {
        fetchOrders();
        fetchCurrentOrder();
        return { success: true, order: res.data };
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
    return { success: false, message: 'Could not cancel order' };
  };

  const addItem = (product) => dispatch({ type: 'ADD_ITEM', payload: product });
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const increment = (id) => dispatch({ type: 'INCREMENT', payload: id });
  const decrement = (id) => dispatch({ type: 'DECREMENT', payload: id });
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    setAppliedPromo(null);
    setServerPromoDiscount(0);
  };
  const openCart = () => dispatch({ type: 'OPEN_CART' });
  const closeCart = () => dispatch({ type: 'CLOSE_CART' });

  const getItemQty = (id) => {
    const item = cartState.items.find((i) => String(i.id) === String(id));
    return item ? item.qty : 0;
  };

  return (
    <CartContext.Provider
      value={{
        items: cartState.items,
        isOpen: cartState.isOpen,
        totalItems,
        subtotal,
        deliveryFee,
        promoDiscount,
        appliedPromo,
        total,
        applyPromo,
        removePromo,
        availableCoupons: AVAILABLE_COUPONS,
        user,
        login,
        signup,
        logout,
        addresses,
        addAddress,
        editAddress,
        deleteAddress,
        addItem,
        removeItem,
        increment,
        decrement,
        clearCart,
        openCart,
        closeCart,
        getItemQty,
        createOrder,
        orders,
        currentOrder,
        fetchOrders,
        fetchCurrentOrder,
        cancelOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
