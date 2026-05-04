import prisma from '../utils/prisma.util';
import { CreateCommentInput, UpdateCommentInput, GetCommentsQuery } from '../validations/comment.validation';

export class CommentService {
  static async getComments(storyId: string, chapterId: string | undefined, query: GetCommentsQuery) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      storyId,
      parentId: null, // Chỉ lấy comment gốc (top-level)
    };

    if (chapterId) {
      whereClause.chapterId = chapterId;
    } else {
      whereClause.chapterId = null; // Nếu không truyền chapterId, nghĩa là đang lấy comment chung của truyện
    }

    const [comments, totalItems] = await Promise.all([
      prisma.comment.findMany({
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
      prisma.comment.count({ where: whereClause }),
    ]);

    // Xử lý ẩn nội dung nếu bị soft-delete
    const formatComment = (comment: any) => {
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

  static async createComment(userId: string, data: CreateCommentInput) {
    // Kiểm tra xem truyện có tồn tại không
    const story = await prisma.story.findUnique({ where: { id: data.storyId } });
    if (!story) throw new Error('Không tìm thấy truyện');

    // Nếu có chapterId, kiểm tra chapter
    if (data.chapterId) {
      const chapter = await prisma.chapter.findUnique({ where: { id: data.chapterId } });
      if (!chapter || chapter.storyId !== data.storyId) {
        throw new Error('Chương truyện không hợp lệ');
      }
    }

    // Nếu có parentId, kiểm tra parent comment
    if (data.parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: data.parentId } });
      if (!parent || parent.storyId !== data.storyId) {
        throw new Error('Bình luận gốc không hợp lệ');
      }
      // Để tránh nested quá sâu (chỉ hỗ trợ 1 level reply), nếu parent comment cũng là reply thì gán parentId = parent.parentId
      if (parent.parentId) {
        data.parentId = parent.parentId;
      }
    }

    const newComment = await prisma.comment.create({
      data: {
        ...data,
        userId,
      },
      include: {
        user: { select: { id: true, displayName: true, avatarUrl: true, username: true, role: true } },
      },
    });

    return newComment;
  }

  static async updateComment(commentId: string, userId: string, role: string, data: UpdateCommentInput) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    
    if (!comment || comment.isDeleted) {
      throw new Error('Không tìm thấy bình luận');
    }

    if (comment.userId !== userId && role !== 'admin') {
      throw new Error('Bạn không có quyền sửa bình luận này');
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: data.content,
        updatedAt: new Date(),
      },
    });

    return updatedComment;
  }

  static async deleteComment(commentId: string, userId: string, role: string) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    
    if (!comment || comment.isDeleted) {
      throw new Error('Không tìm thấy bình luận');
    }

    if (comment.userId !== userId && role !== 'admin') {
      throw new Error('Bạn không có quyền xóa bình luận này');
    }

    // Soft delete
    await prisma.comment.update({
      where: { id: commentId },
      data: {
        isDeleted: true,
        content: '',
      },
    });

    return { message: 'Đã xóa bình luận thành công' };
  }
}
