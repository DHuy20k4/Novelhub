"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_util_1 = __importDefault(require("../utils/prisma.util"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
class AuthService {
    static async register(data) {
        const existingUser = await prisma_util_1.default.user.findFirst({
            where: {
                OR: [{ username: data.username }, { email: data.email }],
            },
        });
        if (existingUser) {
            if (existingUser.username === data.username) {
                throw new Error('Tên đăng nhập đã tồn tại');
            }
            throw new Error('Email đã được sử dụng');
        }
        const saltRounds = 10;
        const passwordHash = await bcrypt_1.default.hash(data.password, saltRounds);
        const newUser = await prisma_util_1.default.user.create({
            data: {
                username: data.username,
                email: data.email,
                passwordHash,
                displayName: data.displayName,
            },
            select: {
                id: true,
                username: true,
                email: true,
                displayName: true,
                role: true,
                createdAt: true,
            },
        });
        return newUser;
    }
    static async login(data) {
        const user = await prisma_util_1.default.user.findUnique({
            where: { username: data.username },
        });
        if (!user) {
            throw new Error('Tài khoản hoặc mật khẩu không đúng');
        }
        if (!user.isActive) {
            throw new Error('Tài khoản của bạn đã bị khóa hoặc chưa kích hoạt');
        }
        if (user.isBanned) {
            throw new Error(`Tài khoản đã bị ban. Lý do: ${user.banReason || 'Không xác định'}`);
        }
        const isMatch = await bcrypt_1.default.compare(data.password, user.passwordHash);
        if (!isMatch) {
            throw new Error('Tài khoản hoặc mật khẩu không đúng');
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        const { passwordHash, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            token,
        };
    }
}
exports.AuthService = AuthService;
