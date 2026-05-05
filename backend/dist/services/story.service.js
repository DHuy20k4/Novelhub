"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryService = void 0;
const prisma_util_1 = __importDefault(require("../utils/prisma.util"));
class StoryService {
    static async getStories(query) {
        const { search, page, limit, categories, sortBy } = query;
        const skip = (page - 1) * limit;
        const whereClause = {};
        if (search) {
            whereClause.OR = [
                { title: { contains: search } },
                { slug: { contains: search } },
            ];
        }
        if (categories) {
            const categorySlugs = categories.split(',').map((c) => c.trim());
            whereClause.categories = {
                some: {
                    category: {
                        slug: { in: categorySlugs },
                    },
                },
            };
        }
        let orderByClause = {};
        switch (sortBy) {
            case 'updated':
                orderByClause = { updatedAt: 'desc' };
                break;
            case 'newest':
                orderByClause = { createdAt: 'desc' };
                break;
            case 'topView':
                orderByClause = { viewCount: 'desc' };
                break;
            case 'topRate':
                orderByClause = { averageRating: 'desc' };
                break;
            default:
                orderByClause = { createdAt: 'desc' };
        }
        const [stories, totalItems] = await Promise.all([
            prisma_util_1.default.story.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: orderByClause,
                include: {
                    uploader: {
                        select: { id: true, displayName: true, avatarUrl: true },
                    },
                    categories: {
                        include: { category: true },
                    },
                },
            }),
            prisma_util_1.default.story.count({ where: whereClause }),
        ]);
        // Format the response slightly to make categories easier to consume
        const formattedStories = stories.map((s) => ({
            ...s,
            categories: s.categories.map((c) => c.category),
        }));
        return {
            data: formattedStories,
            meta: {
                totalItems,
                itemCount: stories.length,
                itemsPerPage: limit,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page,
            },
        };
    }
    static async getStoryById(id) {
        const story = await prisma_util_1.default.story.findUnique({
            where: { id },
            include: {
                uploader: {
                    select: { id: true, displayName: true, avatarUrl: true, username: true },
                },
                categories: {
                    include: { category: true },
                },
                _count: {
                    select: { chapters: true, reviews: true, bookmarks: true },
                },
            },
        });
        if (!story) {
            throw new Error('Không tìm thấy truyện');
        }
        return {
            ...story,
            categories: story.categories.map((c) => c.category),
        };
    }
    static async createStory(uploaderId, data) {
        const { categoryIds, ...storyData } = data;
        const existingSlug = await prisma_util_1.default.story.findUnique({ where: { slug: storyData.slug } });
        if (existingSlug) {
            throw new Error('Slug đã tồn tại, vui lòng chọn đường dẫn khác');
        }
        const newStory = await prisma_util_1.default.story.create({
            data: {
                ...storyData,
                uploaderId,
                categories: {
                    create: categoryIds.map((id) => ({
                        categoryId: id,
                    })),
                },
            },
        });
        return newStory;
    }
    static async updateStory(id, uploaderId, role, data) {
        const story = await prisma_util_1.default.story.findUnique({ where: { id } });
        if (!story) {
            throw new Error('Không tìm thấy truyện');
        }
        if (story.uploaderId !== uploaderId && role !== 'admin') {
            throw new Error('Bạn không có quyền chỉnh sửa truyện này');
        }
        const { categoryIds, ...updateData } = data;
        if (updateData.slug && updateData.slug !== story.slug) {
            const existingSlug = await prisma_util_1.default.story.findUnique({ where: { slug: updateData.slug } });
            if (existingSlug) {
                throw new Error('Slug đã tồn tại, vui lòng chọn đường dẫn khác');
            }
        }
        const updatePayload = { ...updateData };
        if (categoryIds) {
            // Xóa các category cũ và thêm category mới
            updatePayload.categories = {
                deleteMany: {},
                create: categoryIds.map((catId) => ({
                    categoryId: catId,
                })),
            };
        }
        const updatedStory = await prisma_util_1.default.story.update({
            where: { id },
            data: updatePayload,
            include: {
                categories: { include: { category: true } }
            }
        });
        return {
            ...updatedStory,
            categories: updatedStory.categories.map((c) => c.category),
        };
    }
    static async deleteStory(id, uploaderId, role) {
        const story = await prisma_util_1.default.story.findUnique({ where: { id } });
        if (!story) {
            throw new Error('Không tìm thấy truyện');
        }
        if (story.uploaderId !== uploaderId && role !== 'admin') {
            throw new Error('Bạn không có quyền xóa truyện này');
        }
        await prisma_util_1.default.story.delete({
            where: { id },
        });
        return { message: 'Đã xóa truyện thành công' };
    }
}
exports.StoryService = StoryService;
