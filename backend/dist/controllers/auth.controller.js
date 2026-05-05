"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const auth_validation_1 = require("../validations/auth.validation");
class AuthController {
    static async register(req, res, next) {
        try {
            const validatedData = auth_validation_1.registerSchema.parse(req.body);
            const newUser = await auth_service_1.AuthService.register(validatedData);
            res.status(201).json({
                success: true,
                message: 'Đăng ký tài khoản thành công',
                data: newUser,
            });
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu không hợp lệ',
                    errors: error.errors,
                });
            }
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const validatedData = auth_validation_1.loginSchema.parse(req.body);
            const result = await auth_service_1.AuthService.login(validatedData);
            res.status(200).json({
                success: true,
                message: 'Đăng nhập thành công',
                data: result,
            });
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu không hợp lệ',
                    errors: error.errors,
                });
            }
            // Handle known service errors (like incorrect password) with 400
            if (error.message === 'Tài khoản hoặc mật khẩu không đúng' || error.message.includes('khóa')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }
}
exports.AuthController = AuthController;
