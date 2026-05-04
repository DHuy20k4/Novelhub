import { Request, Response, NextFunction } from 'express';
import { StoryService } from '../services/story.service';
import { getStoriesQuerySchema, createStorySchema, updateStorySchema } from '../validations/story.validation';

export class StoryController {
  static async getStories(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedQuery = getStoriesQuerySchema.parse(req.query);
      const result = await StoryService.getStories(validatedQuery);
      
      res.status(200).json({
        success: true,
        message: 'Lấy danh sách truyện thành công',
        ...result,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, message: 'Tham số không hợp lệ', errors: error.errors });
      }
      next(error);
    }
  }

  static async getStoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const story = await StoryService.getStoryById(id);
      
      res.status(200).json({
        success: true,
        data: story,
      });
    } catch (error: any) {
      if (error.message === 'Không tìm thấy truyện') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  static async createStory(req: Request, res: Response, next: NextFunction) {
    try {
      const uploaderId = req.user.id;
      const validatedData = createStorySchema.parse(req.body);
      
      const newStory = await StoryService.createStory(uploaderId, validatedData);
      
      res.status(201).json({
        success: true,
        message: 'Đăng truyện thành công',
        data: newStory,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: error.errors });
      }
      if (error.message.includes('Slug đã tồn tại')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  static async updateStory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const uploaderId = req.user.id;
      const role = req.user.role;
      const validatedData = updateStorySchema.parse(req.body);
      
      const updatedStory = await StoryService.updateStory(id, uploaderId, role, validatedData);
      
      res.status(200).json({
        success: true,
        message: 'Cập nhật truyện thành công',
        data: updatedStory,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: error.errors });
      }
      if (error.message === 'Không tìm thấy truyện') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message.includes('quyền') || error.message.includes('Slug đã tồn tại')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  static async deleteStory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const uploaderId = req.user.id;
      const role = req.user.role;
      
      const result = await StoryService.deleteStory(id, uploaderId, role);
      
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      if (error.message === 'Không tìm thấy truyện') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message.includes('quyền')) {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
}
