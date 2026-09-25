import { Router } from 'express';
import { OrderController } from '../controllers/orderController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/', OrderController.create);
router.get('/', OrderController.getAll);
router.get('/current', OrderController.getCurrent);
router.get('/:id', OrderController.getById);
router.post('/:id/cancel', OrderController.cancel);
router.patch('/:id/status', OrderController.updateStatus);

export default router;
