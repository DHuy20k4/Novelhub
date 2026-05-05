"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChapterService = void 0;
const prisma_util_1 = __importDefault(require("../utils/prisma.util"));
class ChapterService {
    static async getChaptersByStoryId(storyId) {
        const chapters = await prisma_util_1.default.chapter.findMany({
            where: { storyId },
            select: {
                id: true,
                storyId: true,
                chapterIndex: true,
                title: true,
                viewCount: true,
                createdAt: true,
            },
            orderBy: {
                chapterIndex: 'asc',
            },
        });
        return chapters;
    }
    static async getChapterById(chapterId, userId) {
        const chapter = await prisma_util_1.default.chapter.findUnique({
            where: { id: chapterId },
            include: {
                story: {
                    select: { id: true, title: true, slug: true },
                },
            },
        });
        if (!chapter) {
            throw new Error('Không tìm thấy chương truyện');
        }
        // Tăng lượt xem của Chapter và Story
        await prisma_util_1.default.$transaction([
            prisma_util_1.default.chapter.update({
                where: { id: chapterId },
                data: { viewCount: { increment: 1 } },
            }),
            prisma_util_1.default.story.update({
                where: { id: chapter.storyId },
                data: { viewCount: { increment: 1 } },
            }),
        ]);
        // Nếu user đã đăng nhập, lưu vào lịch sử đọc
        if (userId) {
            await prisma_util_1.default.readingHistory.upsert({
                where: {
                    userId_storyId: {
                        userId,
                        storyId: chapter.storyId,
                    },
                },
                update: {
                    chapterId,
                    updatedAt: new Date(),
                },
                create: {
                    userId,
                    storyId: chapter.storyId,
                    chapterId,
                },
            });
        }
        return chapter;
    }
    static async createChapter(storyId, uploaderId, data) {
        const story = await prisma_util_1.default.story.findUnique({ where: { id: storyId } });
        if (!story) {
            throw new Error('Không tìm thấy truyện');
        }
        if (story.uploaderId !== uploaderId) {
            throw new Error('Chỉ tác giả mới được thêm chương cho truyện này');
        }
        const newChapter = await prisma_util_1.default.$transaction(async (tx) => {
            const chapter = await tx.chapter.create({
                data: {
                    ...data,
                    storyId,
                },
            });
            // Tăng số lượng chương của truyện lên 1
            await tx.story.update({
                where: { id: storyId },
                data: { chapterCount: { increment: 1 }, updatedAt: new Date() },
            });
            return chapter;
        });
        return newChapter;
    }
    static async updateChapter(chapterId, uploaderId, role, data) {
        const chapter = await prisma_util_1.default.chapter.findUnique({
            where: { id: chapterId },
            include: { story: true },
        });
        if (!chapter) {
            throw new Error('Không tìm thấy chương truyện');
        }
        if (chapter.story.uploaderId !== uploaderId && role !== 'admin') {
            throw new Error('Bạn không có quyền chỉnh sửa chương này');
        }
        const updatedChapter = await prisma_util_1.default.chapter.update({
            where: { id: chapterId },
            data: {
                ...data,
                story: {
                    update: { updatedAt: new Date() } // Đánh dấu truyện vừa được cập nhật
                }
            },
        });
        return updatedChapter;
    }
    static async deleteChapter(chapterId, uploaderId, role) {
        const chapter = await prisma_util_1.default.chapter.findUnique({
            where: { id: chapterId },
            include: { story: true },
        });
        if (!chapter) {
            throw new Error('Không tìm thấy chương truyện');
        }
        if (chapter.story.uploaderId !== uploaderId && role !== 'admin') {
            throw new Error('Bạn không có quyền xóa chương này');
        }
        await prisma_util_1.default.$transaction(async (tx) => {
            await tx.chapter.delete({
                where: { id: chapterId },
            });
            // Giảm số lượng chương của truyện
            await tx.story.update({
                where: { id: chapter.storyId },
                data: { chapterCount: { decrement: 1 } },
            });
        });
        return { message: 'Đã xóa chương thành công' };
    }
}
exports.ChapterService = ChapterService;
