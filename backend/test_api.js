import http from 'http';

const BASE_URL = 'http://localhost:5001/api';

async function makeRequest(endpoint, { method = 'GET', body = null, headers = {}, cookie = null } = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  return new Promise((resolve, reject) => {
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (cookie) {
      reqHeaders['Cookie'] = cookie;
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => (rawData += chunk));
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(rawData);
          } catch {
            parsed = rawData;
          }
          const setCookie = res.headers['set-cookie'];
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed,
            cookie: setCookie ? setCookie[0].split(';')[0] : null,
          });
        });
      }
    );

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE BACKEND TEST SUITE ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await makeRequest('/health');
    assert(health.status === 200 && health.data.status === 'healthy', 'Health check is operational');

    // 2. Signup new user
    const testEmail = `test_${Date.now()}@example.com`;
    const signupRes = await makeRequest('/auth/signup', {
      method: 'POST',
      body: {
        name: 'Automated Tester',
        email: testEmail,
        password: 'password123',
        confirmPassword: 'password123',
        preferredLanguage: 'gu',
      },
    });
    assert(signupRes.status === 201 && signupRes.data.success && signupRes.cookie, 'Signup creates user and returns HTTP-only cookie');
    const userCookie = signupRes.cookie;

    // 3. /api/auth/me
    const meRes = await makeRequest('/auth/me', { cookie: userCookie });
    assert(meRes.status === 200 && meRes.data.data.email === testEmail, 'GET /api/auth/me identifies user from cookie');

    // 4. Update profile
    const updateRes = await makeRequest('/users/profile', {
      method: 'PUT',
      cookie: userCookie,
      body: { name: 'Updated Tester', preferredLanguage: 'hi' },
    });
    assert(updateRes.status === 200 && updateRes.data.data.preferredLanguage === 'hi', 'PUT /api/users/profile updates language and name');

    // 5. Duplicate signup should return 409
    const dupRes = await makeRequest('/auth/signup', {
      method: 'POST',
      body: {
        name: 'Duplicate Tester',
        email: testEmail,
        password: 'password123',
        confirmPassword: 'password123',
      },
    });
    assert(dupRes.status === 409 && !dupRes.data.success, 'Duplicate signup rejected with 409 Conflict');

    // 6. Categories API
    const catRes = await makeRequest('/categories');
    assert(catRes.status === 200 && Array.isArray(catRes.data.data) && catRes.data.data.length >= 10, 'GET /api/categories returns categories list');

    // 7. Products API & search
    const prodRes = await makeRequest('/products');
    assert(prodRes.status === 200 && prodRes.data.data.length > 50, 'GET /api/products returns products');

    const searchRes = await makeRequest('/products/search?q=ghee');
    assert(searchRes.status === 200 && searchRes.data.data.length > 0, 'GET /api/products/search finds products');

    // 8. Promo code validation
    const promoValid = await makeRequest('/promos/validate', {
      method: 'POST',
      body: { code: 'SAVE50', cartTotal: 600 },
    });
    assert(promoValid.status === 200 && promoValid.data.data.valid && promoValid.data.data.discount === 50, 'Promo code SAVE50 valid for cart >= 499');

    const promoInvalid = await makeRequest('/promos/validate', {
      method: 'POST',
      body: { code: 'SAVE50', cartTotal: 200 },
    });
    assert(promoInvalid.status === 400 && !promoInvalid.data.success, 'Promo code SAVE50 rejected when below minOrder');

    // 9. Address CRUD
    const addAddressRes = await makeRequest('/addresses', {
      method: 'POST',
      cookie: userCookie,
      body: {
        label: 'Home',
        type: 'Home',
        address: 'Flat 101, Test Residency',
        city: 'Ahmedabad, Gujarat',
        pincode: '380015',
      },
    });
    assert(addAddressRes.status === 201 && addAddressRes.data.data.id, 'POST /api/addresses saves new address');
    const addressId = addAddressRes.data.data.id;

    // 10. Order placement with server price calculation & promo
    const orderRes = await makeRequest('/orders', {
      method: 'POST',
      cookie: userCookie,
      body: {
        items: [
          { id: 1, quantity: 2 }, // Fortune Sunflower Oil @ 155 = 310
          { id: 4, quantity: 1 }, // Amul Desi Ghee @ 610 = 610 -> subtotal = 920
        ],
        addressId,
        promoCode: 'SAVE50', // 920 - 50 = 870 + 0 delivery = 870
        paymentMethod: 'COD',
      },
    });
    assert(orderRes.status === 201 && orderRes.data.data.finalTotal === 870, 'POST /api/orders validates prices server-side and applies discount (₹870)');
    const orderId = orderRes.data.data.id;

    // 11. Order isolation check (User 2 tries to access this order)
    const user2Login = await makeRequest('/auth/login', {
      method: 'POST',
      body: { identifier: 'customer@example.com', password: 'password123' },
    });
    const user2Cookie = user2Login.cookie;

    const stealOrder = await makeRequest(`/orders/${orderId}`, { cookie: user2Cookie });
    assert(stealOrder.status === 403, 'Order isolation: User 2 forbidden from viewing User 1 order (403)');

    // 12. Order cancellation rules
    const cancelRes = await makeRequest(`/orders/${orderId}/cancel`, {
      method: 'POST',
      cookie: userCookie,
    });
    assert(cancelRes.status === 200 && cancelRes.data.data.status === 'CANCELLED', 'POST /api/orders/:id/cancel cancels order successfully');

    // 13. Double cancellation fails
    const doubleCancel = await makeRequest(`/orders/${orderId}/cancel`, {
      method: 'POST',
      cookie: userCookie,
    });
    assert(doubleCancel.status === 400, 'Double cancellation rejected cleanly with 400');

    // 14. Bargaining API Tests
    const bargainRes = await makeRequest('/bargains', {
      method: 'POST',
      cookie: userCookie,
      body: {
        productId: 2,
        proposedPrice: 140,
        quantity: 1,
        message: 'Can I get this for ₹140?',
      },
    });
    assert(bargainRes.status === 210 || bargainRes.status === 200, 'POST /api/bargains creates pending bargaining request');
    const bargainId = bargainRes.data.data.id;

    const acceptRes = await makeRequest(`/bargains/admin/${bargainId}/accept`, {
      method: 'POST',
      cookie: userCookie,
      body: { adminResponse: 'Accepted!' },
    });
    assert(acceptRes.status === 200 && acceptRes.data.data.status === 'Accepted', 'POST /api/bargains/admin/:id/accept accepts bargain offer');

    const negotiatedOrderRes = await makeRequest('/orders', {
      method: 'POST',
      cookie: userCookie,
      body: {
        items: [
          { id: 2, quantity: 1, bargainingRequestId: bargainId, isNegotiated: true },
        ],
        addressId,
        paymentMethod: 'COD',
      },
    });
    assert(
      negotiatedOrderRes.status === 201 && negotiatedOrderRes.data.data.items[0].price === 140,
      'POST /api/orders validates negotiated price server-side (₹140 instead of ₹165)'
    );

    // 15. Logout
    const logoutRes = await makeRequest('/auth/logout', { method: 'POST', cookie: userCookie });
    assert(logoutRes.status === 200, 'POST /api/auth/logout succeeds');

    console.log(`\n================================`);
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`================================`);
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTests();
