"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Lấy danh sách review của 1 truyện (Public)
router.get('/story/:storyId', review_controller_1.ReviewController.getReviewsByStoryId);
// Gửi hoặc cập nhật review (Protected)
router.post('/story/:storyId', auth_middleware_1.authenticate, review_controller_1.ReviewController.upsertReview);
// Xóa review (Protected)
router.delete('/story/:storyId', auth_middleware_1.authenticate, review_controller_1.ReviewController.deleteReview);
exports.default = router;
