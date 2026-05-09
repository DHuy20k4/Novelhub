import { Request, Response, NextFunction } from 'express';
import { ReadingHistoryService } from '../services/reading-history.service';

export class ReadingHistoryController {
  static async getReadingHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const history = await ReadingHistoryService.getReadingHistory(userId);
      res.status(200).json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  static async deleteReadingHistoryItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const storyId = req.params.storyId as string;
      const result = await ReadingHistoryService.deleteReadingHistoryItem(userId, storyId);
      res.status(200).json({ success: true, message: result.message });
    } catch (error: any) {
      if (error.message === 'Không tìm thấy lịch sử đọc') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  static async clearAllReadingHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const result = await ReadingHistoryService.clearAllReadingHistory(userId);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }
}
