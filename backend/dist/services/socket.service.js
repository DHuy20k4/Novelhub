"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class SocketService {
    io = null;
    // Map lưu trữ: userId -> socketId
    // Lưu ý: Nếu một user mở nhiều tab, có thể dùng mảng socketId (Set<string>)
    userSockets = new Map();
    init(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: '*', // Trong thực tế nên giới hạn domain của Frontend
                methods: ['GET', 'POST']
            }
        });
        this.io.on('connection', (socket) => {
            console.log(`[Socket] Khách mới kết nối: ${socket.id}`);
            // Lắng nghe sự kiện authenticate từ Frontend sau khi kết nối
            socket.on('authenticate', (data) => {
                try {
                    const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
                    const decoded = jsonwebtoken_1.default.verify(data.token, JWT_SECRET);
                    const userId = decoded.id;
                    // Lưu vào danh sách
                    if (!this.userSockets.has(userId)) {
                        this.userSockets.set(userId, new Set());
                    }
                    this.userSockets.get(userId).add(socket.id);
                    // Gắn userId vào socket object để dễ quản lý khi disconnect
                    socket.userId = userId;
                    console.log(`[Socket] User ${userId} đã xác thực thành công trên socket ${socket.id}`);
                }
                catch (error) {
                    console.error(`[Socket] Xác thực thất bại cho socket ${socket.id}`);
                }
            });
            socket.on('disconnect', () => {
                const userId = socket.userId;
                if (userId) {
                    const sockets = this.userSockets.get(userId);
                    if (sockets) {
                        sockets.delete(socket.id);
                        if (sockets.size === 0) {
                            this.userSockets.delete(userId); // Xóa hẳn userId nếu không còn tab nào
                        }
                    }
                    console.log(`[Socket] User ${userId} ngắt kết nối socket ${socket.id}`);
                }
                else {
                    console.log(`[Socket] Khách ngắt kết nối: ${socket.id}`);
                }
            });
        });
    }
    // Hàm dùng để gọi ở mọi nơi trong Backend
    sendNotificationToUser(userId, notificationData) {
        if (!this.io) {
            console.warn('[Socket] Socket.IO chưa được khởi tạo!');
            return;
        }
        const sockets = this.userSockets.get(userId);
        if (sockets && sockets.size > 0) {
            // Bắn thông báo tới tất cả các tab (socket) mà user đang mở
            sockets.forEach((socketId) => {
                this.io.to(socketId).emit('new_notification', notificationData);
            });
        }
    }
}
exports.default = new SocketService();
