"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chapter_controller_1 = require("../controllers/chapter.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/:id', chapter_controller_1.ChapterController.getChapterById);
// Protected routes
router.put('/:id', auth_middleware_1.authenticate, chapter_controller_1.ChapterController.updateChapter);
router.delete('/:id', auth_middleware_1.authenticate, chapter_controller_1.ChapterController.deleteChapter);
exports.default = router;
