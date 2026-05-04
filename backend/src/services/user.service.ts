import prisma from '../utils/prisma.util';
import { SearchUsersInput, UpdateUserInput } from '../validations/user.validation';

export class UserService {
  static async searchUsers(data: SearchUsersInput) {
    const { search, page, limit } = data;
    const skip = (page - 1) * limit;

    const whereClause = search
      ? {
          OR: [
            { displayName: { contains: search } },
            { username: { contains: search } },
          ],
        }
      : {};

    const [users, totalItems] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              followers: true,
              stories: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return {
      data: users,
      meta: {
        totalItems,
        itemCount: users.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            stories: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    return user;
  }

  static async updateProfile(userId: string, data: UpdateUserInput) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  static async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new Error('Bạn không thể tự theo dõi chính mình');
    }

    const targetUser = await prisma.user.findUnique({ where: { id: followingId } });
    if (!targetUser) {
      throw new Error('Người dùng không tồn tại');
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      throw new Error('Bạn đã theo dõi người dùng này rồi');
    }

    await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    return { message: 'Đã theo dõi thành công' };
  }

  static async unfollowUser(followerId: string, followingId: string) {
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!existingFollow) {
      throw new Error('Bạn chưa theo dõi người dùng này');
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return { message: 'Đã hủy theo dõi thành công' };
  }
}
