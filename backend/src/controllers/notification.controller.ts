import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { z } from 'zod';

const getQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).default(20),
});

export class NotificationController {
  static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const { page, limit } = getQuerySchema.parse(req.query);
      
      const result = await NotificationService.getNotifications(userId, page, limit);
      
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

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notificationId = req.params.id as string;
      const userId = req.user.id;
      
      const result = await NotificationService.markAsRead(notificationId, userId);
      
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      if (error.message === 'Không tìm thấy thông báo') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      
      const result = await NotificationService.markAllAsRead(userId);
      
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
