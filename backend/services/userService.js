import { UserModel } from '../models/User.js';

export class UserService {
  static async getProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    return UserModel.toSafeObject(user);
  }

  static async updateProfile(userId, { name, email, phone, preferredLanguage }) {
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (email !== undefined) updates.email = email.trim().toLowerCase();
    if (phone !== undefined) updates.phone = phone.replace(/\D/g, '');
    if (preferredLanguage !== undefined) {
      const allowedLangs = ['en', 'hi', 'gu'];
      if (!allowedLangs.includes(preferredLanguage)) {
        const error = new Error('Preferred language must be en, hi, or gu');
        error.status = 400;
        throw error;
      }
      updates.preferredLanguage = preferredLanguage;
    }

    const updatedUser = await UserModel.update(userId, updates);
    if (!updatedUser) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    return UserModel.toSafeObject(updatedUser);
  }
}

export default UserService;
