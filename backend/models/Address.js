import { addresses } from '../data/addresses.js';

export class AddressModel {
  static async findByUserId(userId) {
    return addresses.filter((a) => a.userId === userId).map((a) => ({ ...a }));
  }

  static async findById(id) {
    const address = addresses.find((a) => a.id === id);
    return address ? { ...address } : null;
  }

  static async create({ userId, type = 'Home', label, tag, address, city, pincode }) {
    const newAddress = {
      id: `address_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId,
      label: label || type,
      type: type || 'Home',
      tag: tag || '',
      address: address.trim(),
      city: city || 'Ahmedabad, Gujarat',
      pincode: pincode || '',
      createdAt: new Date(),
    };
    addresses.push(newAddress);
    return { ...newAddress };
  }

  static async update(id, userId, updates) {
    const index = addresses.findIndex((a) => a.id === id && a.userId === userId);
    if (index === -1) return null;

    const allowed = ['label', 'type', 'tag', 'address', 'city', 'pincode'];
    allowed.forEach((field) => {
      if (updates[field] !== undefined) {
        addresses[index][field] = updates[field];
      }
    });
    return { ...addresses[index] };
  }

  static async delete(id, userId) {
    const index = addresses.findIndex((a) => a.id === id && a.userId === userId);
    if (index === -1) return false;
    addresses.splice(index, 1);
    return true;
  }
}

export default AddressModel;
