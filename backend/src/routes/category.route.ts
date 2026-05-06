import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public route để lấy danh sách thể loại
router.get('/', CategoryController.getAllCategories);

// Protected routes cho Admin
router.post('/', authenticate, authorizeAdmin, CategoryController.createCategory);
router.put('/:id', authenticate, authorizeAdmin, CategoryController.updateCategory);
router.delete('/:id', authenticate, authorizeAdmin, CategoryController.deleteCategory);

export default router;
