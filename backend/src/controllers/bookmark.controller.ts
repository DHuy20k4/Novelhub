import { Request, Response, NextFunction } from 'express';
import { BookmarkService } from '../services/bookmark.service';
import { toggleBookmarkSchema } from '../validations/bookmark.validation';

export class BookmarkController {
  static async getBookmarks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const bookmarks = await BookmarkService.getBookmarks(userId);
      
      res.status(200).json({
        success: true,
        data: bookmarks,
      });
    } catch (error) {
      next(error);
    }
  }

  static async addBookmark(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const validatedData = toggleBookmarkSchema.parse(req.body);
      
      const newBookmark = await BookmarkService.addBookmark(userId, validatedData.storyId);
      
      res.status(201).json({
        success: true,
        message: 'Đã lưu truyện thành công',
        data: newBookmark,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: error.errors });
      }
      if (error.message === 'Không tìm thấy truyện' || error.message === 'Bạn đã lưu truyện này rồi') {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  static async removeBookmark(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const storyId = req.params.storyId as string;
      
      const result = await BookmarkService.removeBookmark(userId, storyId);
      
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      if (error.message === 'Truyện chưa được lưu') {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
}
