import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import { generateToken } from '../utils/tokenUtils.js';
import { isValidEmail, isValidPhone, isStrongPassword } from '../utils/validators.js';

export class AuthService {
  static async signup({ name, emailOrPhone, email, phone, password, confirmPassword, preferredLanguage = 'en' }) {
    if (!name || name.trim().length < 2) {
      const error = new Error('Please provide a valid name (at least 2 characters).');
      error.status = 400;
      throw error;
    }

    const rawId = emailOrPhone || email || phone;
    if (!rawId || !rawId.trim()) {
      const error = new Error('Please provide an email or 10-digit mobile number.');
      error.status = 400;
      throw error;
    }

    const trimmedIdentifier = rawId.trim();
    const isEmail = isValidEmail(trimmedIdentifier);
    const isPhone = isValidPhone(trimmedIdentifier);

    if (!isEmail && !isPhone) {
      const error = new Error('Please enter a valid email address or 10-digit mobile number.');
      error.status = 400;
      throw error;
    }

    if (!isStrongPassword(password)) {
      const error = new Error('Password must be at least 6 characters long.');
      error.status = 400;
      throw error;
    }

    if (confirmPassword && password !== confirmPassword) {
      const error = new Error('Passwords do not match.');
      error.status = 400;
      throw error;
    }

    // Check if user already exists
    const existing = await UserModel.findByEmailOrPhone(trimmedIdentifier);
    if (existing) {
      const error = new Error('An account with this email/phone already exists. Please log in.');
      error.status = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await UserModel.create({
      name: name.trim(),
      email: isEmail ? trimmedIdentifier.toLowerCase() : null,
      phone: isPhone ? trimmedIdentifier.replace(/\D/g, '') : null,
      passwordHash,
      preferredLanguage,
    });

    const token = generateToken(newUser.id);
    const safeUser = UserModel.toSafeObject(newUser);

    return { user: safeUser, token };
  }

  static async login({ identifier, emailOrPhone, email, phone, password }) {
    const rawId = identifier || emailOrPhone || email || phone;
    if (!rawId || !rawId.trim() || !password) {
      const error = new Error('Please provide your email/phone and password.');
      error.status = 400;
      throw error;
    }

    const trimmedIdentifier = rawId.trim();
    const user = await UserModel.findByEmailOrPhone(trimmedIdentifier);

    // Constant-time check / generic message to prevent user enumeration
    if (!user || !user.passwordHash) {
      const error = new Error('Invalid credentials. Please check your details and try again.');
      error.status = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const error = new Error('Invalid credentials. Please check your details and try again.');
      error.status = 401;
      throw error;
    }

    const token = generateToken(user.id);
    const safeUser = UserModel.toSafeObject(user);

    return { user: safeUser, token };
  }

  static async getMe(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    return UserModel.toSafeObject(user);
  }
}

export default AuthService;
