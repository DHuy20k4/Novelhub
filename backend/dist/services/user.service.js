"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const prisma_util_1 = __importDefault(require("../utils/prisma.util"));
const notification_service_1 = require("./notification.service");
class UserService {
    static async searchUsers(data) {
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
            prisma_util_1.default.user.findMany({
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
            prisma_util_1.default.user.count({ where: whereClause }),
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
    static async getUserProfile(userId) {
        const user = await prisma_util_1.default.user.findUnique({
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
    static async updateProfile(userId, data) {
        const updatedUser = await prisma_util_1.default.user.update({
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
    static async followUser(followerId, followingId) {
        if (followerId === followingId) {
            throw new Error('Bạn không thể tự theo dõi chính mình');
        }
        const targetUser = await prisma_util_1.default.user.findUnique({ where: { id: followingId } });
        if (!targetUser) {
            throw new Error('Người dùng không tồn tại');
        }
        const existingFollow = await prisma_util_1.default.follow.findUnique({
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
        await prisma_util_1.default.follow.create({
            data: {
                followerId,
                followingId,
            },
        });
        // Gửi thông báo
        await notification_service_1.NotificationService.createAndSendNotification(followingId, followerId, 'USER', followerId, 'FOLLOW', 'đã bắt đầu theo dõi bạn.');
        return { message: 'Đã theo dõi thành công' };
    }
    static async unfollowUser(followerId, followingId) {
        const existingFollow = await prisma_util_1.default.follow.findUnique({
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
        await prisma_util_1.default.follow.delete({
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
exports.UserService = UserService;
