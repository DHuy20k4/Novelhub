import { Router } from 'express';
import { ReadingHistoryController } from '../controllers/reading-history.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Tất cả đều yêu cầu đăng nhập
router.get('/', authenticate, ReadingHistoryController.getReadingHistory);
router.delete('/clear', authenticate, ReadingHistoryController.clearAllReadingHistory);
router.delete('/:storyId', authenticate, ReadingHistoryController.deleteReadingHistoryItem);

export default router;
