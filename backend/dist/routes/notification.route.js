"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Tất cả route đều yêu cầu đăng nhập
router.use(auth_middleware_1.authenticate);
router.get('/', notification_controller_1.NotificationController.getNotifications);
router.patch('/read-all', notification_controller_1.NotificationController.markAllAsRead);
router.patch('/:id/read', notification_controller_1.NotificationController.markAsRead);
exports.default = router;
