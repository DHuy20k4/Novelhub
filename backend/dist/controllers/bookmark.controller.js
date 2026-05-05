"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarkController = void 0;
const bookmark_service_1 = require("../services/bookmark.service");
const bookmark_validation_1 = require("../validations/bookmark.validation");
class BookmarkController {
    static async getBookmarks(req, res, next) {
        try {
            const userId = req.user.id;
            const bookmarks = await bookmark_service_1.BookmarkService.getBookmarks(userId);
            res.status(200).json({
                success: true,
                data: bookmarks,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async addBookmark(req, res, next) {
        try {
            const userId = req.user.id;
            const validatedData = bookmark_validation_1.toggleBookmarkSchema.parse(req.body);
            const newBookmark = await bookmark_service_1.BookmarkService.addBookmark(userId, validatedData.storyId);
            res.status(201).json({
                success: true,
                message: 'Đã lưu truyện thành công',
                data: newBookmark,
            });
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: error.errors });
            }
            if (error.message === 'Không tìm thấy truyện' || error.message === 'Bạn đã lưu truyện này rồi') {
                return res.status(400).json({ success: false, message: error.message });
            }
            next(error);
        }
    }
    static async removeBookmark(req, res, next) {
        try {
            const userId = req.user.id;
            const storyId = req.params.storyId;
            const result = await bookmark_service_1.BookmarkService.removeBookmark(userId, storyId);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
            if (error.message === 'Truyện chưa được lưu') {
                return res.status(400).json({ success: false, message: error.message });
            }
            next(error);
        }
    }
}
exports.BookmarkController = BookmarkController;
