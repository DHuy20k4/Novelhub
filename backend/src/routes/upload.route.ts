import { Router } from 'express';
import { uploadImage } from '../controllers/upload.controller';
import upload from '../middlewares/upload.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint: POST /api/upload
// Note: We use the `authenticate` middleware so only logged-in users can upload images
// 'image' is the field name expected in the FormData
router.post('/', authenticate, upload.single('image'), uploadImage);

export default router;
