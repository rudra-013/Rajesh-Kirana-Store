import { Router } from 'express';
import { PromoController } from '../controllers/promoController.js';

const router = Router();

router.get('/', PromoController.getAll);
router.post('/validate', PromoController.validate);

export default router;
