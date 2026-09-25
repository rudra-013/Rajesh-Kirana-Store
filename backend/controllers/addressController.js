import { AddressService } from '../services/addressService.js';
import { successResponse, errorResponse } from '../utils/responseUtils.js';

export class AddressController {
  static async getAll(req, res, next) {
    try {
      const addresses = await AddressService.getUserAddresses(req.user.id);
      return successResponse(res, addresses, 'User addresses retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const { label, address, city, pincode, phone, isDefault } = req.body;
      const newAddress = await AddressService.createAddress(req.user.id, {
        label,
        address,
        city,
        pincode,
        phone,
        isDefault,
      });
      return successResponse(res, newAddress, 'Address saved successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const updatedAddress = await AddressService.updateAddress(id, req.user.id, req.body);
      return successResponse(res, updatedAddress, 'Address updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async remove(req, res, next) {
    try {
      const { id } = req.params;
      const result = await AddressService.deleteAddress(id, req.user.id);
      return successResponse(res, result, 'Address deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}
