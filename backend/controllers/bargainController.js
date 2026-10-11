import { BargainModel } from '../models/Bargain.js';
import { successResponse, errorResponse } from '../utils/responseUtils.js';

export const createBargainRequest = async (req, res, next) => {
  try {
    const { productId, proposedPrice, quantity, message } = req.body;

    if (!productId) {
      return errorResponse(res, 'Product ID is required.', 400);
    }
    if (!proposedPrice) {
      return errorResponse(res, 'Proposed price is required.', 400);
    }

    // Check if customer already has a pending request for this product
    const existingPending = await BargainModel.findPendingByCustomerAndProduct(
      req.user.id,
      productId
    );
    if (existingPending) {
      return errorResponse(
        res,
        'You already have a pending price negotiation request for this product. Please wait for admin approval.',
        400
      );
    }

    const bargain = await BargainModel.create({
      customerId: req.user.id,
      customerName: req.user.name || 'Customer',
      customerPhone: req.user.phone || '9876543210',
      productId,
      proposedPrice,
      quantity: quantity || 1,
      customerMessage: message || '',
    });

    return successResponse(res, bargain, 'Your price request has been sent to the admin.', 210);
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to submit bargain request.', 400);
  }
};

export const getMyBargainRequests = async (req, res, next) => {
  try {
    const requests = await BargainModel.findByCustomerId(req.user.id);
    return successResponse(res, requests, 'Bargain requests retrieved.');
  } catch (err) {
    return errorResponse(res, 'Failed to fetch bargain requests.', 500);
  }
};

export const getAdminBargainRequests = async (req, res, next) => {
  try {
    const requests = await BargainModel.findAll();
    return successResponse(res, requests, 'Admin bargain requests retrieved.');
  } catch (err) {
    return errorResponse(res, 'Failed to fetch admin bargain requests.', 500);
  }
};

export const acceptBargainRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminResponse, expiryHours } = req.body;

    const bargain = await BargainModel.accept(id, {
      adminResponse,
      expiryHours: Number(expiryHours) || 24,
    });

    if (!bargain) {
      return errorResponse(res, 'Bargain request not found.', 404);
    }

    return successResponse(res, bargain, 'Bargain request accepted successfully!');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to accept bargain request.', 400);
  }
};

export const rejectBargainRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminResponse } = req.body;

    const bargain = await BargainModel.reject(id, { adminResponse });

    if (!bargain) {
      return errorResponse(res, 'Bargain request not found.', 404);
    }

    return successResponse(res, bargain, 'Bargain request rejected.');
  } catch (err) {
    return errorResponse(res, err.message || 'Failed to reject bargain request.', 400);
  }
};

export const validateBargainRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bargain = await BargainModel.findById(id);

    if (!bargain) {
      return errorResponse(res, 'Bargaining request not found.', 404);
    }

    if (bargain.customerId !== req.user.id) {
      return errorResponse(res, 'Unauthorized access to bargaining request.', 403);
    }

    if (bargain.status !== 'Accepted') {
      return errorResponse(res, `This price offer is currently '${bargain.status}'.`, 400);
    }

    if (bargain.expiryTime && new Date() > new Date(bargain.expiryTime)) {
      return errorResponse(res, 'This negotiated price offer has expired.', 400);
    }

    return successResponse(res, bargain, 'Negotiated price offer is valid.');
  } catch (err) {
    return errorResponse(res, 'Validation error.', 500);
  }
};
