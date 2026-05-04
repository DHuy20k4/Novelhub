import { Router } from 'express';
import { ChapterController } from '../controllers/chapter.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/:id', ChapterController.getChapterById);

// Protected routes
router.put('/:id', authenticate, ChapterController.updateChapter);
router.delete('/:id', authenticate, ChapterController.deleteChapter);

export default router;
