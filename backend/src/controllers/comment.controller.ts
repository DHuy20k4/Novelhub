import { Request, Response, NextFunction } from 'express';
import { CommentService } from '../services/comment.service';
import { createCommentSchema, updateCommentSchema, getCommentsQuerySchema } from '../validations/comment.validation';

export class CommentController {
  static async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const storyId = req.params.storyId as string;
      const chapterId = req.query.chapterId as string | undefined;
      const validatedQuery = getCommentsQuerySchema.parse(req.query);
      
      const result = await CommentService.getComments(storyId, chapterId, validatedQuery);
      
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

  static async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const validatedData = createCommentSchema.parse(req.body);
      
      const newComment = await CommentService.createComment(userId, validatedData);
      
      res.status(201).json({
        success: true,
        message: 'Gửi bình luận thành công',
        data: newComment,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: error.errors });
      }
      if (error.message.includes('không hợp lệ') || error.message === 'Không tìm thấy truyện') {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  static async updateComment(req: Request, res: Response, next: NextFunction) {
    try {
      const commentId = req.params.id as string;
      const userId = req.user.id;
      const role = req.user.role;
      const validatedData = updateCommentSchema.parse(req.body);
      
      const updatedComment = await CommentService.updateComment(commentId, userId, role, validatedData);
      
      res.status(200).json({
        success: true,
        message: 'Cập nhật bình luận thành công',
        data: updatedComment,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: error.errors });
      }
      if (error.message === 'Không tìm thấy bình luận') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message.includes('quyền')) {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  static async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const commentId = req.params.id as string;
      const userId = req.user.id;
      const role = req.user.role;
      
      const result = await CommentService.deleteComment(commentId, userId, role);
      
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      if (error.message === 'Không tìm thấy bình luận') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message.includes('quyền')) {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
}
