import prisma from '../utils/prisma.util';

export class BookmarkService {
  static async getBookmarks(userId: string) {
    const bookmarks = await prisma.bookmark.findMany({
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

  static async addBookmark(userId: string, storyId: string) {
    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) {
      throw new Error('Không tìm thấy truyện');
    }

    const existingBookmark = await prisma.bookmark.findUnique({
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

    const newBookmark = await prisma.bookmark.create({
      data: {
        userId,
        storyId,
      },
    });

    return newBookmark;
  }

  static async removeBookmark(userId: string, storyId: string) {
    const existingBookmark = await prisma.bookmark.findUnique({
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

    await prisma.bookmark.delete({
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
