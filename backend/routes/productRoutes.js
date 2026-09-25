import { Router } from 'express';
import { ProductController } from '../controllers/productController.js';

const router = Router();

router.get('/search', ProductController.search);
router.get('/category/:category', ProductController.getByCategory);
router.get('/:id', ProductController.getById);
router.get('/', ProductController.getAll);

export default router;
