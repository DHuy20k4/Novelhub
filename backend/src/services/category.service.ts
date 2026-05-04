import prisma from '../utils/prisma.util';

export class CategoryService {
  static async getAllCategories() {
    // Lấy tất cả category và đếm số lượng truyện thuộc category đó (tùy chọn)
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: { stories: true },
        },
      },
    });

    return categories;
  }
}
