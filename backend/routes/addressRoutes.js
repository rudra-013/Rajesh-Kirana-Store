import { Router } from 'express';
import { AddressController } from '../controllers/addressController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', AddressController.getAll);
router.post('/', AddressController.create);
router.put('/:id', AddressController.update);
router.delete('/:id', AddressController.remove);

export default router;
