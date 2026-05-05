"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const prisma_util_1 = __importDefault(require("../utils/prisma.util"));
const notification_service_1 = require("./notification.service");
class CommentService {
    static async getComments(storyId, chapterId, query) {
        const { page, limit } = query;
        const skip = (page - 1) * limit;
        const whereClause = {
            storyId,
            parentId: null, // Chỉ lấy comment gốc (top-level)
        };
        if (chapterId) {
            whereClause.chapterId = chapterId;
        }
        else {
            whereClause.chapterId = null; // Nếu không truyền chapterId, nghĩa là đang lấy comment chung của truyện
        }
        const [comments, totalItems] = await Promise.all([
            prisma_util_1.default.comment.findMany({
                where: whereClause,
                skip,
                take: limit,
                include: {
                    user: {
                        select: { id: true, displayName: true, avatarUrl: true, username: true, role: true },
                    },
                    replies: {
                        include: {
                            user: {
                                select: { id: true, displayName: true, avatarUrl: true, username: true, role: true },
                            },
                        },
                        orderBy: {
                            createdAt: 'asc', // Reply cũ xếp trên
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc', // Comment gốc mới xếp trên
                },
            }),
            prisma_util_1.default.comment.count({ where: whereClause }),
        ]);
        // Xử lý ẩn nội dung nếu bị soft-delete
        const formatComment = (comment) => {
            if (comment.isDeleted) {
                comment.content = 'Bình luận đã bị xóa';
                comment.user = null; // Có thể ẩn luôn người dùng
            }
            if (comment.replies) {
                comment.replies = comment.replies.map(formatComment);
            }
            return comment;
        };
        const formattedComments = comments.map(formatComment);
        return {
            data: formattedComments,
            meta: {
                totalItems,
                itemCount: comments.length,
                itemsPerPage: limit,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page,
            },
        };
    }
    static async createComment(userId, data) {
        // Kiểm tra xem truyện có tồn tại không
        const story = await prisma_util_1.default.story.findUnique({ where: { id: data.storyId } });
        if (!story)
            throw new Error('Không tìm thấy truyện');
        // Nếu có chapterId, kiểm tra chapter
        if (data.chapterId) {
            const chapter = await prisma_util_1.default.chapter.findUnique({ where: { id: data.chapterId } });
            if (!chapter || chapter.storyId !== data.storyId) {
                throw new Error('Chương truyện không hợp lệ');
            }
        }
        // Nếu có parentId, kiểm tra parent comment
        let parentUserId = null;
        if (data.parentId) {
            const parent = await prisma_util_1.default.comment.findUnique({ where: { id: data.parentId } });
            if (!parent || parent.storyId !== data.storyId) {
                throw new Error('Bình luận gốc không hợp lệ');
            }
            parentUserId = parent.userId;
            // Để tránh nested quá sâu (chỉ hỗ trợ 1 level reply), nếu parent comment cũng là reply thì gán parentId = parent.parentId
            if (parent.parentId) {
                data.parentId = parent.parentId;
            }
        }
        const newComment = await prisma_util_1.default.comment.create({
            data: {
                ...data,
                userId,
            },
            include: {
                user: { select: { id: true, displayName: true, avatarUrl: true, username: true, role: true } },
            },
        });
        // Gửi thông báo
        if (data.parentId && parentUserId && parentUserId !== userId) {
            // Báo cho chủ comment gốc
            await notification_service_1.NotificationService.createAndSendNotification(parentUserId, userId, 'COMMENT', newComment.id, 'REPLY', `đã trả lời bình luận của bạn.`);
        }
        else if (!data.parentId && story.uploaderId !== userId) {
            // Báo cho tác giả truyện
            await notification_service_1.NotificationService.createAndSendNotification(story.uploaderId, userId, 'STORY', story.id, 'COMMENT', `đã bình luận về truyện "${story.title}".`);
        }
        return newComment;
    }
    static async updateComment(commentId, userId, role, data) {
        const comment = await prisma_util_1.default.comment.findUnique({ where: { id: commentId } });
        if (!comment || comment.isDeleted) {
            throw new Error('Không tìm thấy bình luận');
        }
        if (comment.userId !== userId && role !== 'admin') {
            throw new Error('Bạn không có quyền sửa bình luận này');
        }
        const updatedComment = await prisma_util_1.default.comment.update({
            where: { id: commentId },
            data: {
                content: data.content,
                updatedAt: new Date(),
            },
        });
        return updatedComment;
    }
    static async deleteComment(commentId, userId, role) {
        const comment = await prisma_util_1.default.comment.findUnique({ where: { id: commentId } });
        if (!comment || comment.isDeleted) {
            throw new Error('Không tìm thấy bình luận');
        }
        if (comment.userId !== userId && role !== 'admin') {
            throw new Error('Bạn không có quyền xóa bình luận này');
        }
        // Soft delete
        await prisma_util_1.default.comment.update({
            where: { id: commentId },
            data: {
                isDeleted: true,
                content: '',
            },
        });
        return { message: 'Đã xóa bình luận thành công' };
    }
}
exports.CommentService = CommentService;
