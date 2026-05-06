import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Tất cả các route trong file này đều yêu cầu quyền admin
router.use(authenticate, authorizeAdmin);

// Thống kê Dashboard
router.get('/stats', AdminController.getStats);

// Quản lý Users
router.get('/users', AdminController.getAllUsers);

export default router;
