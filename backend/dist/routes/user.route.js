"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Lấy danh sách users (Tìm kiếm Profile)
router.get('/', user_controller_1.UserController.searchUsers);
// --- PROTECTED ROUTES cho "me" ---
// Phải đặt trước /:id để tránh bị hiểu nhầm "me" là một ID
router.get('/me', auth_middleware_1.authenticate, user_controller_1.UserController.getMyProfile);
router.patch('/me', auth_middleware_1.authenticate, user_controller_1.UserController.updateMyProfile);
// --- PUBLIC ROUTES cho ID cụ thể ---
router.get('/:id', user_controller_1.UserController.getUserProfile);
// --- PROTECTED ROUTES cho thao tác Follow ---
router.post('/:id/follows', auth_middleware_1.authenticate, user_controller_1.UserController.followUser);
router.delete('/:id/follows', auth_middleware_1.authenticate, user_controller_1.UserController.unfollowUser);
exports.default = router;
