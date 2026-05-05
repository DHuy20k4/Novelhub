"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChapterController = void 0;
const chapter_service_1 = require("../services/chapter.service");
const chapter_validation_1 = require("../validations/chapter.validation");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class ChapterController {
    static async getChaptersByStoryId(req, res, next) {
        try {
            const storyId = req.params.storyId;
            const chapters = await chapter_service_1.ChapterService.getChaptersByStoryId(storyId);
            res.status(200).json({
                success: true,
                data: chapters,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getChapterById(req, res, next) {
        try {
            const chapterId = req.params.id;
            let userId = undefined;
            // Try to extract userId from token if present (for reading history)
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                try {
                    const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
                    const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                    userId = decoded.id;
                }
                catch (e) {
                    // Token invalid, ignore it (read as guest)
                }
            }
            const chapter = await chapter_service_1.ChapterService.getChapterById(chapterId, userId);
            res.status(200).json({
                success: true,
                data: chapter,
            });
        }
        catch (error) {
            if (error.message === 'Không tìm thấy chương truyện') {
                return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }
    static async createChapter(req, res, next) {
        try {
            const storyId = req.params.storyId;
            const uploaderId = req.user.id;
            const validatedData = chapter_validation_1.createChapterSchema.parse(req.body);
            const newChapter = await chapter_service_1.ChapterService.createChapter(storyId, uploaderId, validatedData);
            res.status(201).json({
                success: true,
                message: 'Thêm chương truyện thành công',
                data: newChapter,
            });
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: error.errors });
            }
            if (error.message === 'Không tìm thấy truyện') {
                return res.status(404).json({ success: false, message: error.message });
            }
            if (error.message.includes('tác giả mới được thêm')) {
                return res.status(403).json({ success: false, message: error.message });
            }
            next(error);
        }
    }
    static async updateChapter(req, res, next) {
        try {
            const chapterId = req.params.id;
            const uploaderId = req.user.id;
            const role = req.user.role;
            const validatedData = chapter_validation_1.updateChapterSchema.parse(req.body);
            const updatedChapter = await chapter_service_1.ChapterService.updateChapter(chapterId, uploaderId, role, validatedData);
            res.status(200).json({
                success: true,
                message: 'Cập nhật chương truyện thành công',
                data: updatedChapter,
            });
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: error.errors });
            }
            if (error.message === 'Không tìm thấy chương truyện') {
                return res.status(404).json({ success: false, message: error.message });
            }
            if (error.message.includes('quyền')) {
                return res.status(403).json({ success: false, message: error.message });
            }
            next(error);
        }
    }
    static async deleteChapter(req, res, next) {
        try {
            const chapterId = req.params.id;
            const uploaderId = req.user.id;
            const role = req.user.role;
            const result = await chapter_service_1.ChapterService.deleteChapter(chapterId, uploaderId, role);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
            if (error.message === 'Không tìm thấy chương truyện') {
                return res.status(404).json({ success: false, message: error.message });
            }
            if (error.message.includes('quyền')) {
                return res.status(403).json({ success: false, message: error.message });
            }
            next(error);
        }
    }
}
exports.ChapterController = ChapterController;
