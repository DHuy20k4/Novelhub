import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

import authRoutes from './auth.route';

// Import and use other route files here
router.use('/auth', authRoutes);

export default router;
