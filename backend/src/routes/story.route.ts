import { Router } from 'express';
import { StoryController } from '../controllers/story.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', StoryController.getStories);
router.get('/:id', StoryController.getStoryById);

// Nested routes for Chapters
import { ChapterController } from '../controllers/chapter.controller';
router.get('/:storyId/chapters', ChapterController.getChaptersByStoryId);
router.post('/:storyId/chapters', authenticate, ChapterController.createChapter);

// Protected routes
router.post('/', authenticate, StoryController.createStory);
router.put('/:id', authenticate, StoryController.updateStory);
router.delete('/:id', authenticate, StoryController.deleteStory);

export default router;
