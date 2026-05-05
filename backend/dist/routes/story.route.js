"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const story_controller_1 = require("../controllers/story.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/', story_controller_1.StoryController.getStories);
router.get('/:id', story_controller_1.StoryController.getStoryById);
// Nested routes for Chapters
const chapter_controller_1 = require("../controllers/chapter.controller");
router.get('/:storyId/chapters', chapter_controller_1.ChapterController.getChaptersByStoryId);
router.post('/:storyId/chapters', auth_middleware_1.authenticate, chapter_controller_1.ChapterController.createChapter);
// Protected routes
router.post('/', auth_middleware_1.authenticate, story_controller_1.StoryController.createStory);
router.put('/:id', auth_middleware_1.authenticate, story_controller_1.StoryController.updateStory);
router.delete('/:id', auth_middleware_1.authenticate, story_controller_1.StoryController.deleteStory);
exports.default = router;
