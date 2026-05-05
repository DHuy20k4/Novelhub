"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comment_controller_1 = require("../controllers/comment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
// GET /api/comments/story/:storyId?chapterId=...&page=1
router.get('/story/:storyId', comment_controller_1.CommentController.getComments);
// Protected routes
router.post('/', auth_middleware_1.authenticate, comment_controller_1.CommentController.createComment);
router.put('/:id', auth_middleware_1.authenticate, comment_controller_1.CommentController.updateComment);
router.delete('/:id', auth_middleware_1.authenticate, comment_controller_1.CommentController.deleteComment);
exports.default = router;
