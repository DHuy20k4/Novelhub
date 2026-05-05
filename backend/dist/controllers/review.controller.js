"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const review_service_1 = require("../services/review.service");
const review_validation_1 = require("../validations/review.validation");
class ReviewController {
    static async getReviewsByStoryId(req, res, next) {
        try {
            const storyId = req.params.storyId;
            const validatedQuery = review_validation_1.getReviewsQuerySchema.parse(req.query);
            const result = await review_service_1.ReviewService.getReviewsByStoryId(storyId, validatedQuery);
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
    static async upsertReview(req, res, next) {
        try {
            const userId = req.user.id;
            const storyId = req.params.storyId;
            const validatedData = review_validation_1.reviewSchema.parse(req.body);
            const review = await review_service_1.ReviewService.upsertReview(userId, storyId, validatedData);
            res.status(200).json({
                success: true,
                message: 'Gửi đánh giá thành công',
                data: review,
            });
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: error.errors });
            }
            if (error.message === 'Không tìm thấy truyện') {
                return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }
    static async deleteReview(req, res, next) {
        try {
            const userId = req.user.id;
            const role = req.user.role;
            const storyId = req.params.storyId;
            const result = await review_service_1.ReviewService.deleteReview(userId, storyId, role);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
            if (error.message === 'Bạn chưa đánh giá truyện này') {
                return res.status(404).json({ success: false, message: error.message });
            }
            if (error.message.includes('quyền')) {
                return res.status(403).json({ success: false, message: error.message });
            }
            next(error);
        }
    }
}
exports.ReviewController = ReviewController;
