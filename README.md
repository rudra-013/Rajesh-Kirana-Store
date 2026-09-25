# KiranaGo - Quick Commerce Grocery Delivery Platform

KiranaGo is a modern Indian quick-commerce / online kirana shopping application built with React (frontend) and Node.js / Express (backend).

---

## 📁 Project Architecture

```text
Shop/
├── frontend/                     # React + Vite Client Application
│   ├── src/
│   │   ├── components/           # UI Components (Cards, Header, Cart Drawer, etc.)
│   │   ├── context/              # CartContext with seamless API bindings
│   │   ├── data/                 # Categories & UI constants
│   │   ├── pages/                # Views (Home, Category, Checkout, Profile, etc.)
│   │   ├── services/             # API client (api.js) connecting to Express backend
│   │   └── styles/               # CSS Design tokens and global theme
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Node.js + Express REST API Server
│   ├── config/                   # Environment & configuration loader
│   ├── controllers/              # Request / Response controllers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── cartController.js
│   │   ├── promoController.js
│   │   ├── addressController.js
│   │   └── orderController.js
│   ├── data/                     # In-memory datasets (database-free)
│   │   ├── users.js
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── addresses.js
│   │   ├── orders.js
│   │   ├── promoCodes.js
│   │   └── carts.js
│   ├── middleware/               # Auth & Error handling middlewares
│   │   ├── authMiddleware.js     # HTTP-only cookie + Bearer token verification
│   │   └── errorMiddleware.js    # Clean 404 & centralized error responses
│   ├── models/                   # Data access layer (ready for DB swap)
│   ├── routes/                   # Express route definitions
│   ├── services/                 # Business logic & server-side validation
│   ├── utils/                    # Response, token, and validator utilities
│   ├── .env.example              # Sample environment configuration
│   ├── server.js                 # Express server entry point
│   ├── package.json
│   └── test_api.js               # Comprehensive test suite (16 tests)
│
└── README.md
```

---

## 🚀 Running the Project Locally

### 1. Start the Backend Server

```bash
cd backend
npm install
npm run dev # or node server.js
```

Backend will run on: `http://localhost:5001` (health check at `http://localhost:5001/api/health`)

### 2. Start the Frontend Application

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on: `http://localhost:5173`

---

## 🔒 Security & Authentication

- **HTTP-Only Cookies**: Authentication session token stored in `kiranago_token` cookie (prevents XSS attacks).
- **Fallback Bearer Token**: Supports `Authorization: Bearer <token>` for API clients & mobile compatibility.
- **Bcrypt Password Hashing**: Plaintext passwords are never stored; bcrypt salt + hash implemented.
- **Safe User Projection**: `passwordHash` is stripped before returning user data to frontend.
- **User Isolation**: Strict ownership enforcement prevents User A from accessing User B's orders, addresses, or cart.
- **Server-Side Pricing**: Order subtotals and discounts are computed strictly using backend product data, preventing price manipulation.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/signup`: Create a new user account
- `POST /api/auth/login`: Authenticate with email/phone & password
- `POST /api/auth/logout`: Invalidate session and clear HTTP-only cookie
- `GET /api/auth/me`: Retrieve currently authenticated user

### User Profile (`/api/users`)
- `GET /api/users/profile`: Retrieve user profile
- `PUT /api/users/profile`: Update name, phone, email, and preferred language (`en`, `hi`, `gu`)

### Products (`/api/products`)
- `GET /api/products`: List all products (with optional `?category=...&subCategory=...&sort=...`)
- `GET /api/products/search?q=query`: Search products by name, category, or subcategory
- `GET /api/products/category/:category`: Filter products by category
- `GET /api/products/:id`: Get product details

### Categories (`/api/categories`)
- `GET /api/categories`: List all 20 store categories
- `GET /api/categories/:id`: Get category details

### Cart (`/api/cart`)
- `GET /api/cart`: Get authenticated user's cart
- `POST /api/cart/items`: Add item to cart
- `PUT /api/cart/items/:productId`: Update item quantity
- `DELETE /api/cart/items/:productId`: Remove item from cart
- `DELETE /api/cart`: Clear cart

### Promo Codes (`/api/promos`)
- `GET /api/promos`: Get active promotional coupons
- `POST /api/promos/validate`: Validate promo code and compute discount server-side

### Saved Addresses (`/api/addresses`)
- `GET /api/addresses`: Get user's saved addresses
- `POST /api/addresses`: Add new address
- `PUT /api/addresses/:id`: Edit address
- `DELETE /api/addresses/:id`: Delete address

### Orders (`/api/orders`)
- `POST /api/orders`: Place new order (calculates totals & discounts server-side)
- `GET /api/orders`: Get authenticated user's order history
- `GET /api/orders/current`: Get active in-progress order
- `GET /api/orders/:id`: Get order by ID (with user isolation)
- `POST /api/orders/:id/cancel`: Cancel order (allowed for `PLACED` & `CONFIRMED` statuses)
- `PATCH /api/orders/:id/status`: Update status (`PLACED`, `CONFIRMED`, `PREPARING`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`)

---

## 🗄️ Database-Ready Architecture

The backend is built with a decoupled Model/Service design:
- Controllers call Services (e.g. `OrderService`, `AuthService`).
- Services query Models (e.g. `OrderModel`, `UserModel`, `ProductModel`).
- To migrate to MongoDB / Mongoose or PostgreSQL / Prisma in the future:
  1. Replace the methods inside `backend/models/*.js` with DB queries.
  2. Routes, controllers, middlewares, and frontend calls require **zero changes**.
