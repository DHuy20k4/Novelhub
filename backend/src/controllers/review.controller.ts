import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';
import { getReviewsQuerySchema, reviewSchema } from '../validations/review.validation';

export class ReviewController {
  static async getReviewsByStoryId(req: Request, res: Response, next: NextFunction) {
    try {
      const storyId = req.params.storyId as string;
      const validatedQuery = getReviewsQuerySchema.parse(req.query);
      
      const result = await ReviewService.getReviewsByStoryId(storyId, validatedQuery);
      
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, message: 'Tham số không hợp lệ', errors: error.errors });
      }
      next(error);
    }
  }

  static async upsertReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const storyId = req.params.storyId as string;
      const validatedData = reviewSchema.parse(req.body);
      
      const review = await ReviewService.upsertReview(userId, storyId, validatedData);
      
      res.status(200).json({
        success: true,
        message: 'Gửi đánh giá thành công',
        data: review,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: error.errors });
      }
      if (error.message === 'Không tìm thấy truyện') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  static async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const role = req.user.role;
      const storyId = req.params.storyId as string;
      
      const result = await ReviewService.deleteReview(userId, storyId, role);
      
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      if (error.message === 'Bạn chưa đánh giá truyện này') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message.includes('quyền')) {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
}
