"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = require("../services/notification.service");
const zod_1 = require("zod");
const getQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).default(1),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).default(20),
});
class NotificationController {
    static async getNotifications(req, res, next) {
        try {
            const userId = req.user.id;
            const { page, limit } = getQuerySchema.parse(req.query);
            const result = await notification_service_1.NotificationService.getNotifications(userId, page, limit);
            res.status(200).json({
                success: true,
                ...result,
            });
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return res.status(400).json({ success: false, message: 'Tham số không hợp lệ', errors: error.errors });
            }
            next(error);
        }
    }
    static async markAsRead(req, res, next) {
        try {
            const notificationId = req.params.id;
            const userId = req.user.id;
            const result = await notification_service_1.NotificationService.markAsRead(notificationId, userId);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
            if (error.message === 'Không tìm thấy thông báo') {
                return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }
    static async markAllAsRead(req, res, next) {
        try {
            const userId = req.user.id;
            const result = await notification_service_1.NotificationService.markAllAsRead(userId);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.NotificationController = NotificationController;
