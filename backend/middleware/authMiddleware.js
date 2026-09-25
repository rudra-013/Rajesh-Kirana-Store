import { verifyToken } from '../utils/tokenUtils.js';
import { UserModel } from '../models/User.js';
import { errorResponse } from '../utils/responseUtils.js';
import { config } from '../config/config.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Try reading from HTTP-only cookie
    if (req.cookies && req.cookies[config.cookieName]) {
      token = req.cookies[config.cookieName];
    }
    // 2. Fallback to Authorization: Bearer <token>
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 'Authentication required. Please log in.', 401);
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return errorResponse(res, 'Session invalid or expired. Please log in again.', 401);
    }

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 'User account no longer exists.', 401);
    }

    // Attach safe user object to request
    req.user = UserModel.toSafeObject(user);
    next();
  } catch (error) {
    return errorResponse(res, 'Authentication failed.', 401);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.cookies && req.cookies[config.cookieName]) {
      token = req.cookies[config.cookieName];
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        const user = await UserModel.findById(decoded.id);
        if (user) {
          req.user = UserModel.toSafeObject(user);
        }
      }
    }
  } catch (err) {
    // Ignore error for optional auth
  }
  next();
};
