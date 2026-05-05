"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarkService = void 0;
const prisma_util_1 = __importDefault(require("../utils/prisma.util"));
class BookmarkService {
    static async getBookmarks(userId) {
        const bookmarks = await prisma_util_1.default.bookmark.findMany({
            where: { userId },
            include: {
                story: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        coverUrl: true,
                        uploader: { select: { displayName: true } },
                        averageRating: true,
                        viewCount: true,
                        chapterCount: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return bookmarks;
    }
    static async addBookmark(userId, storyId) {
        const story = await prisma_util_1.default.story.findUnique({ where: { id: storyId } });
        if (!story) {
            throw new Error('Không tìm thấy truyện');
        }
        const existingBookmark = await prisma_util_1.default.bookmark.findUnique({
            where: {
                userId_storyId: {
                    userId,
                    storyId,
                },
            },
        });
        if (existingBookmark) {
            throw new Error('Bạn đã lưu truyện này rồi');
        }
        const newBookmark = await prisma_util_1.default.bookmark.create({
            data: {
                userId,
                storyId,
            },
        });
        return newBookmark;
    }
    static async removeBookmark(userId, storyId) {
        const existingBookmark = await prisma_util_1.default.bookmark.findUnique({
            where: {
                userId_storyId: {
                    userId,
                    storyId,
                },
            },
        });
        if (!existingBookmark) {
            throw new Error('Truyện chưa được lưu');
        }
        await prisma_util_1.default.bookmark.delete({
            where: {
                userId_storyId: {
                    userId,
                    storyId,
                },
            },
        });
        return { message: 'Đã bỏ lưu truyện thành công' };
    }
}
exports.BookmarkService = BookmarkService;
