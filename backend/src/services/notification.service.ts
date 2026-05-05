import prisma from '../utils/prisma.util';
import SocketService from './socket.service';

export class NotificationService {
  /**
   * Tạo thông báo và bắn qua Socket.IO nếu user đang online
   */
  static async createAndSendNotification(
    receiverId: string,
    senderId: string | null,
    targetType: string,
    targetId: string,
    actionType: string,
    message: string
  ) {
    try {
      // 1. Lưu vào Database
      const notification = await prisma.notification.create({
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
      SocketService.sendNotificationToUser(receiverId, notification);

      return notification;
    } catch (error) {
      console.error('[NotificationService] Lỗi khi tạo thông báo:', error);
      throw error;
    }
  }

  static async getNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [notifications, totalItems, unreadCount] = await Promise.all([
      prisma.notification.findMany({
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
      prisma.notification.count({ where: { receiverId: userId } }),
      prisma.notification.count({ where: { receiverId: userId, isRead: false } }),
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

  static async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
    
    if (!notification || notification.receiverId !== userId) {
      throw new Error('Không tìm thấy thông báo');
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return { message: 'Đã đánh dấu là đã đọc' };
  }

  static async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { receiverId: userId, isRead: false },
      data: { isRead: true },
    });

    return { message: 'Đã đánh dấu toàn bộ là đã đọc' };
  }
}
