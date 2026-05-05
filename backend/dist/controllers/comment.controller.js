"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentController = void 0;
const comment_service_1 = require("../services/comment.service");
const comment_validation_1 = require("../validations/comment.validation");
class CommentController {
    static async getComments(req, res, next) {
        try {
            const storyId = req.params.storyId;
            const chapterId = req.query.chapterId;
            const validatedQuery = comment_validation_1.getCommentsQuerySchema.parse(req.query);
            const result = await comment_service_1.CommentService.getComments(storyId, chapterId, validatedQuery);
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
    static async createComment(req, res, next) {
        try {
            const userId = req.user.id;
            const validatedData = comment_validation_1.createCommentSchema.parse(req.body);
            const newComment = await comment_service_1.CommentService.createComment(userId, validatedData);
            res.status(201).json({
                success: true,
                message: 'Gửi bình luận thành công',
                data: newComment,
            });
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: error.errors });
            }
            if (error.message.includes('không hợp lệ') || error.message === 'Không tìm thấy truyện') {
                return res.status(400).json({ success: false, message: error.message });
            }
            next(error);
        }
    }
    static async updateComment(req, res, next) {
        try {
            const commentId = req.params.id;
            const userId = req.user.id;
            const role = req.user.role;
            const validatedData = comment_validation_1.updateCommentSchema.parse(req.body);
            const updatedComment = await comment_service_1.CommentService.updateComment(commentId, userId, role, validatedData);
            res.status(200).json({
                success: true,
                message: 'Cập nhật bình luận thành công',
                data: updatedComment,
            });
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: error.errors });
            }
            if (error.message === 'Không tìm thấy bình luận') {
                return res.status(404).json({ success: false, message: error.message });
            }
            if (error.message.includes('quyền')) {
                return res.status(403).json({ success: false, message: error.message });
            }
            next(error);
        }
    }
    static async deleteComment(req, res, next) {
        try {
            const commentId = req.params.id;
            const userId = req.user.id;
            const role = req.user.role;
            const result = await comment_service_1.CommentService.deleteComment(commentId, userId, role);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
            if (error.message === 'Không tìm thấy bình luận') {
                return res.status(404).json({ success: false, message: error.message });
            }
            if (error.message.includes('quyền')) {
                return res.status(403).json({ success: false, message: error.message });
            }
            next(error);
        }
    }
}
exports.CommentController = CommentController;
