"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const user_validation_1 = require("../validations/user.validation");
class UserController {
    static async searchUsers(req, res, next) {
        try {
            const validatedQuery = user_validation_1.searchUsersSchema.parse(req.query);
            const result = await user_service_1.UserService.searchUsers(validatedQuery);
            res.status(200).json({
                success: true,
                message: 'Lấy danh sách người dùng thành công',
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
    static async getMyProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const profile = await user_service_1.UserService.getUserProfile(userId);
            res.status(200).json({
                success: true,
                data: profile,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateMyProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const validatedData = user_validation_1.updateUserSchema.parse(req.body);
            const updatedProfile = await user_service_1.UserService.updateProfile(userId, validatedData);
            res.status(200).json({
                success: true,
                message: 'Cập nhật thông tin thành công',
                data: updatedProfile,
            });
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: error.errors });
            }
            next(error);
        }
    }
    static async getUserProfile(req, res, next) {
        try {
            const userId = req.params.id;
            const profile = await user_service_1.UserService.getUserProfile(userId);
            res.status(200).json({
                success: true,
                data: profile,
            });
        }
        catch (error) {
            if (error.message === 'Không tìm thấy người dùng') {
                return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }
    static async followUser(req, res, next) {
        try {
            const followerId = req.user.id;
            const followingId = req.params.id;
            const result = await user_service_1.UserService.followUser(followerId, followingId);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    static async unfollowUser(req, res, next) {
        try {
            const followerId = req.user.id;
            const followingId = req.params.id;
            const result = await user_service_1.UserService.unfollowUser(followerId, followingId);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
}
exports.UserController = UserController;
