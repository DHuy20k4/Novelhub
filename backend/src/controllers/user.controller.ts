import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { searchUsersSchema, updateUserSchema } from '../validations/user.validation';

export class UserController {
  static async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedQuery = searchUsersSchema.parse(req.query);
      const result = await UserService.searchUsers(validatedQuery);
      
      res.status(200).json({
        success: true,
        message: 'Lấy danh sách người dùng thành công',
        ...result,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, message: 'Tham số không hợp lệ', errors: error.errors });
      }
      next(error);
    }
  }

  static async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const profile = await UserService.getUserProfile(userId);
      
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const validatedData = updateUserSchema.parse(req.body);
      
      const updatedProfile = await UserService.updateProfile(userId, validatedData);
      
      res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin thành công',
        data: updatedProfile,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: error.errors });
      }
      next(error);
    }
  }

  static async getUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id as string;
      const profile = await UserService.getUserProfile(userId);
      
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      if (error.message === 'Không tìm thấy người dùng') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  static async followUser(req: Request, res: Response, next: NextFunction) {
    try {
      const followerId = req.user.id;
      const followingId = req.params.id as string;
      
      const result = await UserService.followUser(followerId, followingId);
      
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async unfollowUser(req: Request, res: Response, next: NextFunction) {
    try {
      const followerId = req.user.id;
      const followingId = req.params.id as string;
      
      const result = await UserService.unfollowUser(followerId, followingId);
      
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
