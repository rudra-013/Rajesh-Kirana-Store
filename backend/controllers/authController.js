import { AuthService } from '../services/authService.js';
import { sendTokenCookie, clearTokenCookie } from '../utils/tokenUtils.js';
import { successResponse, errorResponse } from '../utils/responseUtils.js';

export class AuthController {
  static async signup(req, res, next) {
    try {
      const { name, email, phone, password, confirmPassword, preferredLanguage } = req.body;
      const { user, token } = await AuthService.signup({
        name,
        email,
        phone,
        password,
        confirmPassword,
        preferredLanguage,
      });

      sendTokenCookie(res, token);
      return successResponse(res, { user, token }, 'Registration successful', 201);
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { identifier, email, phone, password } = req.body;
      const loginIdentifier = identifier || email || phone;

      const { user, token } = await AuthService.login({
        identifier: loginIdentifier,
        password,
      });

      sendTokenCookie(res, token);
      return successResponse(res, { user, token }, 'Login successful');
    } catch (err) {
      next(err);
    }
  }

  static async logout(req, res, next) {
    try {
      clearTokenCookie(res);
      return successResponse(res, null, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req, res, next) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Not authenticated', 401);
      }
      return successResponse(res, req.user, 'Current user profile');
    } catch (err) {
      next(err);
    }
  }
}
