"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookmark_controller_1 = require("../controllers/bookmark.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Tất cả các route bookmark đều yêu cầu đăng nhập
router.use(auth_middleware_1.authenticate);
router.get('/', bookmark_controller_1.BookmarkController.getBookmarks);
router.post('/', bookmark_controller_1.BookmarkController.addBookmark);
router.delete('/:storyId', bookmark_controller_1.BookmarkController.removeBookmark);
exports.default = router;
