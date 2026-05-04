import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Lấy danh sách review của 1 truyện (Public)
router.get('/story/:storyId', ReviewController.getReviewsByStoryId);

// Gửi hoặc cập nhật review (Protected)
router.post('/story/:storyId', authenticate, ReviewController.upsertReview);

// Xóa review (Protected)
router.delete('/story/:storyId', authenticate, ReviewController.deleteReview);

export default router;
