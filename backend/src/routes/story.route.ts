import { Router } from 'express';
import { StoryController } from '../controllers/story.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', StoryController.getStories);
router.get('/:id', StoryController.getStoryById);

// Protected routes
router.post('/', authenticate, StoryController.createStory);
router.put('/:id', authenticate, StoryController.updateStory);
router.delete('/:id', authenticate, StoryController.deleteStory);

export default router;
