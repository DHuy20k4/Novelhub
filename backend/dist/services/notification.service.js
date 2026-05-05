"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const prisma_util_1 = __importDefault(require("../utils/prisma.util"));
const socket_service_1 = __importDefault(require("./socket.service"));
class NotificationService {
    /**
     * Tạo thông báo và bắn qua Socket.IO nếu user đang online
     */
    static async createAndSendNotification(receiverId, senderId, targetType, targetId, actionType, message) {
        try {
            // 1. Lưu vào Database
            const notification = await prisma_util_1.default.notification.create({
                data: {
                    receiverId,
                    senderId,
                    targetType,
                    targetId,
                    actionType,
                    notificationMessage: message,
                },
                include: {
                    sender: {
                        select: { displayName: true, avatarUrl: true }
                    }
                }
            });
            // 2. Bắn qua Socket.IO
            socket_service_1.default.sendNotificationToUser(receiverId, notification);
            return notification;
        }
        catch (error) {
            console.error('[NotificationService] Lỗi khi tạo thông báo:', error);
            throw error;
        }
    }
    static async getNotifications(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [notifications, totalItems, unreadCount] = await Promise.all([
            prisma_util_1.default.notification.findMany({
                where: { receiverId: userId },
                skip,
                take: limit,
                include: {
                    sender: {
                        select: { displayName: true, avatarUrl: true }
                    }
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            prisma_util_1.default.notification.count({ where: { receiverId: userId } }),
            prisma_util_1.default.notification.count({ where: { receiverId: userId, isRead: false } }),
        ]);
        return {
            data: notifications,
            meta: {
                totalItems,
                unreadCount,
                itemCount: notifications.length,
                itemsPerPage: limit,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page,
            },
        };
    }
    static async markAsRead(notificationId, userId) {
        const notification = await prisma_util_1.default.notification.findUnique({ where: { id: notificationId } });
        if (!notification || notification.receiverId !== userId) {
            throw new Error('Không tìm thấy thông báo');
        }
        await prisma_util_1.default.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
        return { message: 'Đã đánh dấu là đã đọc' };
    }
    static async markAllAsRead(userId) {
        await prisma_util_1.default.notification.updateMany({
            where: { receiverId: userId, isRead: false },
            data: { isRead: true },
        });
        return { message: 'Đã đánh dấu toàn bộ là đã đọc' };
    }
}
exports.NotificationService = NotificationService;
