import { Router } from 'express';
import { BookmarkController } from '../controllers/bookmark.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Tất cả các route bookmark đều yêu cầu đăng nhập
router.use(authenticate);

router.get('/', BookmarkController.getBookmarks);
router.post('/', BookmarkController.addBookmark);
router.delete('/:storyId', BookmarkController.removeBookmark);

export default router;
