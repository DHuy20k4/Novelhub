import prisma from '../utils/prisma.util';
import { CreateChapterInput, UpdateChapterInput } from '../validations/chapter.validation';

export class ChapterService {
  static async getChaptersByStoryId(storyId: string) {
    const chapters = await prisma.chapter.findMany({
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

  static async getChapterById(chapterId: string, userId?: string) {
    const chapter = await prisma.chapter.findUnique({
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
    await prisma.$transaction([
      prisma.chapter.update({
        where: { id: chapterId },
        data: { viewCount: { increment: 1 } },
      }),
      prisma.story.update({
        where: { id: chapter.storyId },
        data: { viewCount: { increment: 1 } },
      }),
    ]);

    // Nếu user đã đăng nhập, lưu vào lịch sử đọc
    if (userId) {
      await prisma.readingHistory.upsert({
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

  static async createChapter(storyId: string, uploaderId: string, data: CreateChapterInput) {
    const story = await prisma.story.findUnique({ where: { id: storyId } });
    
    if (!story) {
      throw new Error('Không tìm thấy truyện');
    }

    if (story.uploaderId !== uploaderId) {
      throw new Error('Chỉ tác giả mới được thêm chương cho truyện này');
    }

    const newChapter = await prisma.$transaction(async (tx) => {
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

  static async updateChapter(chapterId: string, uploaderId: string, role: string, data: UpdateChapterInput) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { story: true },
    });

    if (!chapter) {
      throw new Error('Không tìm thấy chương truyện');
    }

    if (chapter.story.uploaderId !== uploaderId && role !== 'admin') {
      throw new Error('Bạn không có quyền chỉnh sửa chương này');
    }

    const updatedChapter = await prisma.chapter.update({
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

  static async deleteChapter(chapterId: string, uploaderId: string, role: string) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { story: true },
    });

    if (!chapter) {
      throw new Error('Không tìm thấy chương truyện');
    }

    if (chapter.story.uploaderId !== uploaderId && role !== 'admin') {
      throw new Error('Bạn không có quyền xóa chương này');
    }

    await prisma.$transaction(async (tx) => {
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
