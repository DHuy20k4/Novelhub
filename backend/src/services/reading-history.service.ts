import prisma from '../utils/prisma.util';

export class ReadingHistoryService {
  static async getReadingHistory(userId: string) {
    const history = await prisma.readingHistory.findMany({
      where: { userId },
      include: {
        story: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverUrl: true,
            chapterCount: true,
            uploader: { select: { displayName: true } },
          },
        },
        chapter: {
          select: {
            id: true,
            title: true,
            chapterIndex: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return history;
  }

  static async deleteReadingHistoryItem(userId: string, storyId: string) {
    const item = await prisma.readingHistory.findUnique({
      where: { userId_storyId: { userId, storyId } },
    });

    if (!item) {
      throw new Error('Không tìm thấy lịch sử đọc');
    }

    await prisma.readingHistory.delete({
      where: { userId_storyId: { userId, storyId } },
    });

    return { message: 'Đã xóa khỏi lịch sử đọc' };
  }

  static async clearAllReadingHistory(userId: string) {
    await prisma.readingHistory.deleteMany({ where: { userId } });
    return { message: 'Đã xóa toàn bộ lịch sử đọc' };
  }
}
