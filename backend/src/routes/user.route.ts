import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Lấy danh sách users (Tìm kiếm Profile)
router.get('/', UserController.searchUsers);

// --- PROTECTED ROUTES cho "me" ---
// Phải đặt trước /:id để tránh bị hiểu nhầm "me" là một ID
router.get('/me', authenticate, UserController.getMyProfile);
router.patch('/me', authenticate, UserController.updateMyProfile);

// --- PUBLIC ROUTES cho ID cụ thể ---
router.get('/:id', UserController.getUserProfile);

// --- PROTECTED ROUTES cho thao tác Follow ---
router.post('/:id/follows', authenticate, UserController.followUser);
router.delete('/:id/follows', authenticate, UserController.unfollowUser);

export default router;
