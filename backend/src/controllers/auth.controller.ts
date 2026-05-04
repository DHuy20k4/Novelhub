import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../validations/auth.validation';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const newUser = await AuthService.register(validatedData);
      
      res.status(201).json({
        success: true,
        message: 'Đăng ký tài khoản thành công',
        data: newUser,
      });
    } catch (error: any) {
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

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await AuthService.login(validatedData);

      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        data: result,
      });
    } catch (error: any) {
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
