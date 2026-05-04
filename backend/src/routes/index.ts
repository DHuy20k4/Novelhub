import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

import authRoutes from './auth.route';
import userRoutes from './user.route';
import categoryRoutes from './category.route';
import storyRoutes from './story.route';
import chapterRoutes from './chapter.route';
import bookmarkRoutes from './bookmark.route';
import reviewRoutes from './review.route';

// Import and use other route files here
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/stories', storyRoutes);
router.use('/chapters', chapterRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/reviews', reviewRoutes);

export default router;
