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

  static async createCategory(data: { name: string; slug: string }) {
    const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
    if (existing) throw new Error('Đường dẫn (slug) đã tồn tại');

    return prisma.category.create({ data });
  }

  static async updateCategory(id: string, data: { name?: string; slug?: string }) {
    if (data.slug) {
      const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
      if (existing && existing.id !== id) throw new Error('Đường dẫn (slug) đã tồn tại');
    }

    return prisma.category.update({
      where: { id },
      data,
    });
  }

  static async deleteCategory(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }
}
