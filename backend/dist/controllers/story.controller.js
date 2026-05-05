"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryController = void 0;
const story_service_1 = require("../services/story.service");
const story_validation_1 = require("../validations/story.validation");
class StoryController {
    static async getStories(req, res, next) {
        try {
            const validatedQuery = story_validation_1.getStoriesQuerySchema.parse(req.query);
            const result = await story_service_1.StoryService.getStories(validatedQuery);
            res.status(200).json({
                success: true,
                message: 'Lấy danh sách truyện thành công',
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
    static async getStoryById(req, res, next) {
        try {
            const id = req.params.id;
            const story = await story_service_1.StoryService.getStoryById(id);
            res.status(200).json({
                success: true,
                data: story,
            });
        }
        catch (error) {
            if (error.message === 'Không tìm thấy truyện') {
                return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }
    static async createStory(req, res, next) {
        try {
            const uploaderId = req.user.id;
            const validatedData = story_validation_1.createStorySchema.parse(req.body);
            const newStory = await story_service_1.StoryService.createStory(uploaderId, validatedData);
            res.status(201).json({
                success: true,
                message: 'Đăng truyện thành công',
                data: newStory,
            });
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: error.errors });
            }
            if (error.message.includes('Slug đã tồn tại')) {
                return res.status(400).json({ success: false, message: error.message });
            }
            next(error);
        }
    }
    static async updateStory(req, res, next) {
        try {
            const id = req.params.id;
            const uploaderId = req.user.id;
            const role = req.user.role;
            const validatedData = story_validation_1.updateStorySchema.parse(req.body);
            const updatedStory = await story_service_1.StoryService.updateStory(id, uploaderId, role, validatedData);
            res.status(200).json({
                success: true,
                message: 'Cập nhật truyện thành công',
                data: updatedStory,
            });
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ', errors: error.errors });
            }
            if (error.message === 'Không tìm thấy truyện') {
                return res.status(404).json({ success: false, message: error.message });
            }
            if (error.message.includes('quyền') || error.message.includes('Slug đã tồn tại')) {
                return res.status(400).json({ success: false, message: error.message });
            }
            next(error);
        }
    }
    static async deleteStory(req, res, next) {
        try {
            const id = req.params.id;
            const uploaderId = req.user.id;
            const role = req.user.role;
            const result = await story_service_1.StoryService.deleteStory(id, uploaderId, role);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
            if (error.message === 'Không tìm thấy truyện') {
                return res.status(404).json({ success: false, message: error.message });
            }
            if (error.message.includes('quyền')) {
                return res.status(403).json({ success: false, message: error.message });
            }
            next(error);
        }
    }
}
exports.StoryController = StoryController;
