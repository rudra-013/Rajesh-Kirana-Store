import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  createBargainRequest,
  getMyBargainRequests,
  getAdminBargainRequests,
  acceptBargainRequest,
  rejectBargainRequest,
  validateBargainRequest,
} from '../controllers/bargainController.js';

const router = express.Router();

// Customer Endpoints
router.post('/', authenticate, createBargainRequest);
router.get('/my-requests', authenticate, getMyBargainRequests);
router.get('/validate/:id', authenticate, validateBargainRequest);

// Admin Endpoints
router.get('/admin/all', authenticate, getAdminBargainRequests);
router.post('/admin/:id/accept', authenticate, acceptBargainRequest);
router.post('/admin/:id/reject', authenticate, rejectBargainRequest);

export default router;
