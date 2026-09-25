import { AddressModel } from '../models/Address.js';

export class AddressService {
  static async getAddresses(userId) {
    return AddressModel.findByUserId(userId);
  }

  static async getUserAddresses(userId) {
    return this.getAddresses(userId);
  }

  static async addAddress(userId, { type, label, tag, address, city, pincode }) {
    if (!address || !address.trim()) {
      const error = new Error('Street address is required.');
      error.status = 400;
      throw error;
    }
    return AddressModel.create({
      userId,
      type: type || 'Home',
      label,
      tag,
      address,
      city,
      pincode,
    });
  }

  static async createAddress(userId, data) {
    return this.addAddress(userId, data);
  }

  static async updateAddress(id, userId, updates) {
    const existing = await AddressModel.findById(id);
    if (!existing) {
      const error = new Error('Address not found');
      error.status = 404;
      throw error;
    }
    if (existing.userId !== userId) {
      const error = new Error('Forbidden. You do not have permission to modify this address.');
      error.status = 403;
      throw error;
    }

    return AddressModel.update(id, userId, updates);
  }

  static async deleteAddress(id, userId) {
    const existing = await AddressModel.findById(id);
    if (!existing) {
      const error = new Error('Address not found');
      error.status = 404;
      throw error;
    }
    if (existing.userId !== userId) {
      const error = new Error('Forbidden. You do not have permission to delete this address.');
      error.status = 403;
      throw error;
    }

    return AddressModel.delete(id, userId);
  }
}

export default AddressService;
