import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';

const router = Router();

// Public route để lấy danh sách thể loại
router.get('/', CategoryController.getAllCategories);

export default router;
