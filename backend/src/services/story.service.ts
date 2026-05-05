import prisma from '../utils/prisma.util';
import { GetStoriesQuery, CreateStoryInput, UpdateStoryInput } from '../validations/story.validation';

export class StoryService {
  static async getStories(query: GetStoriesQuery) {
    const { search, page, limit, categories, sortBy } = query;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

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

    if (query.uploaderId) {
      whereClause.uploaderId = query.uploaderId;
    }

    let orderByClause: any = {};
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
      prisma.story.findMany({
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
      prisma.story.count({ where: whereClause }),
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

  static async getStoryById(id: string) {
    const story = await prisma.story.findUnique({
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

  static async createStory(uploaderId: string, data: CreateStoryInput) {
    const { categoryIds, ...storyData } = data;

    const existingSlug = await prisma.story.findUnique({ where: { slug: storyData.slug } });
    if (existingSlug) {
      throw new Error('Slug đã tồn tại, vui lòng chọn đường dẫn khác');
    }

    const newStory = await prisma.story.create({
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

  static async updateStory(id: string, uploaderId: string, role: string, data: UpdateStoryInput) {
    const story = await prisma.story.findUnique({ where: { id } });
    if (!story) {
      throw new Error('Không tìm thấy truyện');
    }

    if (story.uploaderId !== uploaderId && role !== 'admin') {
      throw new Error('Bạn không có quyền chỉnh sửa truyện này');
    }

    const { categoryIds, ...updateData } = data;

    if (updateData.slug && updateData.slug !== story.slug) {
      const existingSlug = await prisma.story.findUnique({ where: { slug: updateData.slug } });
      if (existingSlug) {
        throw new Error('Slug đã tồn tại, vui lòng chọn đường dẫn khác');
      }
    }

    const updatePayload: any = { ...updateData };

    if (categoryIds) {
      // Xóa các category cũ và thêm category mới
      updatePayload.categories = {
        deleteMany: {},
        create: categoryIds.map((catId) => ({
          categoryId: catId,
        })),
      };
    }

    const updatedStory = await prisma.story.update({
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

  static async deleteStory(id: string, uploaderId: string, role: string) {
    const story = await prisma.story.findUnique({ where: { id } });
    if (!story) {
      throw new Error('Không tìm thấy truyện');
    }

    if (story.uploaderId !== uploaderId && role !== 'admin') {
      throw new Error('Bạn không có quyền xóa truyện này');
    }

    await prisma.story.delete({
      where: { id },
    });

    return { message: 'Đã xóa truyện thành công' };
  }
}
