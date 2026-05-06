import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma.util';

export class AdminController {
  // Thống kê tổng quan
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const [totalUsers, totalStories, totalChapters, totalCategories] = await Promise.all([
        prisma.user.count(),
        prisma.story.count(),
        prisma.chapter.count(),
        prisma.category.count(),
      ]);

      res.status(200).json({
        success: true,
        data: {
          users: totalUsers,
          stories: totalStories,
          chapters: totalChapters,
          categories: totalCategories,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Lấy danh sách người dùng
  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            role: true,
            isActive: true,
            isBanned: true,
            createdAt: true,
            _count: {
              select: { stories: true, comments: true, reviews: true },
            },
          },
        }),
        prisma.user.count(),
      ]);

      res.status(200).json({
        success: true,
        data: users,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
