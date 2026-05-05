"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running' });
});
const auth_route_1 = __importDefault(require("./auth.route"));
const user_route_1 = __importDefault(require("./user.route"));
const category_route_1 = __importDefault(require("./category.route"));
const story_route_1 = __importDefault(require("./story.route"));
const chapter_route_1 = __importDefault(require("./chapter.route"));
const bookmark_route_1 = __importDefault(require("./bookmark.route"));
const review_route_1 = __importDefault(require("./review.route"));
const comment_route_1 = __importDefault(require("./comment.route"));
const notification_route_1 = __importDefault(require("./notification.route"));
const upload_route_1 = __importDefault(require("./upload.route"));
// Import and use other route files here
router.use('/auth', auth_route_1.default);
router.use('/users', user_route_1.default);
router.use('/categories', category_route_1.default);
router.use('/stories', story_route_1.default);
router.use('/chapters', chapter_route_1.default);
router.use('/bookmarks', bookmark_route_1.default);
router.use('/reviews', review_route_1.default);
router.use('/comments', comment_route_1.default);
router.use('/notifications', notification_route_1.default);
router.use('/upload', upload_route_1.default);
exports.default = router;
