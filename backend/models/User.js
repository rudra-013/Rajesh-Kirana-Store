import { users } from '../data/users.js';

export class UserModel {
  static async findById(id) {
    const user = users.find((u) => u.id === id);
    if (!user) return null;
    return { ...user };
  }

  static async findByEmailOrPhone(identifier) {
    if (!identifier) return null;
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/\D/g, '');

    const user = users.find(
      (u) =>
        (u.email && u.email.toLowerCase() === cleanId) ||
        (cleanPhone && u.phone && u.phone.replace(/\D/g, '') === cleanPhone)
    );
    if (!user) return null;
    return { ...user };
  }

  static async create({ name, email, phone, passwordHash, preferredLanguage = 'en' }) {
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : null,
      phone: phone ? phone.replace(/\D/g, '') : null,
      passwordHash,
      preferredLanguage,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.push(newUser);
    return { ...newUser };
  }

  static async update(id, updates) {
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    const allowed = ['name', 'email', 'phone', 'preferredLanguage', 'passwordHash'];
    allowed.forEach((field) => {
      if (updates[field] !== undefined) {
        users[index][field] = updates[field];
      }
    });
    users[index].updatedAt = new Date();
    return { ...users[index] };
  }

  static toSafeObject(user) {
    if (!user) return null;
    const { passwordHash, ...safe } = user;
    return safe;
  }
}

export default UserModel;
