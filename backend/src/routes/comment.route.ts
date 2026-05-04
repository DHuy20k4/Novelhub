import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
// GET /api/comments/story/:storyId?chapterId=...&page=1
router.get('/story/:storyId', CommentController.getComments);

// Protected routes
router.post('/', authenticate, CommentController.createComment);
router.put('/:id', authenticate, CommentController.updateComment);
router.delete('/:id', authenticate, CommentController.deleteComment);

export default router;
