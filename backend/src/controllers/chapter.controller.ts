import { Request, Response, NextFunction } from 'express';
import { ChapterService } from '../services/chapter.service';
import { createChapterSchema, updateChapterSchema } from '../validations/chapter.validation';
import jwt from 'jsonwebtoken';

export class ChapterController {
  static async getChaptersByStoryId(req: Request, res: Response, next: NextFunction) {
    try {
      const storyId = req.params.storyId as string;
      const chapters = await ChapterService.getChaptersByStoryId(storyId);
      
      res.status(200).json({
        success: true,
        data: chapters,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getChapterById(req: Request, res: Response, next: NextFunction) {
    try {
      const chapterId = req.params.id as string;
      let userId: string | undefined = undefined;

      // Try to extract userId from token if present (for reading history)
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
          const decoded: any = jwt.verify(token, JWT_SECRET);
          userId = decoded.id;
        } catch (e) {
          // Token invalid, ignore it (read as guest)
        }
      }

      const chapter = await ChapterService.getChapterById(chapterId, userId);
      
      res.status(200).json({
        success: true,
        data: chapter,
      });
    } catch (error: any) {
      if (error.message === 'Không tìm thấy chương truyện') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  static async createChapter(req: Request, res: Response, next: NextFunction) {
    try {
      const storyId = req.params.storyId as string;
      const uploaderId = req.user.id;
      const validatedData = createChapterSchema.parse(req.body);
      
      const newChapter = await ChapterService.createChapter(storyId, uploaderId, validatedData);
      
      res.status(201).json({
        success: true,
        message: 'Thêm chương truyện thành công',
        data: newChapter,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: error.errors });
      }
      if (error.message === 'Không tìm thấy truyện') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message.includes('tác giả mới được thêm')) {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  static async updateChapter(req: Request, res: Response, next: NextFunction) {
    try {
      const chapterId = req.params.id as string;
      const uploaderId = req.user.id;
      const role = req.user.role;
      const validatedData = updateChapterSchema.parse(req.body);
      
      const updatedChapter = await ChapterService.updateChapter(chapterId, uploaderId, role, validatedData);
      
      res.status(200).json({
        success: true,
        message: 'Cập nhật chương truyện thành công',
        data: updatedChapter,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: error.errors });
      }
      if (error.message === 'Không tìm thấy chương truyện') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message.includes('quyền')) {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  static async deleteChapter(req: Request, res: Response, next: NextFunction) {
    try {
      const chapterId = req.params.id as string;
      const uploaderId = req.user.id;
      const role = req.user.role;
      
      const result = await ChapterService.deleteChapter(chapterId, uploaderId, role);
      
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      if (error.message === 'Không tìm thấy chương truyện') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message.includes('quyền')) {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
}
