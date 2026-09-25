import { UserService } from '../services/userService.js';
import { successResponse } from '../utils/responseUtils.js';

export class UserController {
  static async getProfile(req, res, next) {
    try {
      const user = await UserService.getProfile(req.user.id);
      return successResponse(res, user, 'Profile retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { name, email, phone, preferredLanguage } = req.body;
      const updatedUser = await UserService.updateProfile(req.user.id, {
        name,
        email,
        phone,
        preferredLanguage,
      });
      return successResponse(res, updatedUser, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  }
}
