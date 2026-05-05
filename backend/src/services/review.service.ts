import prisma from '../utils/prisma.util';
import { ReviewInput, GetReviewsQuery } from '../validations/review.validation';
import { NotificationService } from './notification.service';

export class ReviewService {
  static async getReviewsByStoryId(storyId: string, query: GetReviewsQuery) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [reviews, totalItems] = await Promise.all([
      prisma.review.findMany({
        where: { storyId },
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, displayName: true, avatarUrl: true, username: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.review.count({ where: { storyId } }),
    ]);

    return {
      data: reviews,
      meta: {
        totalItems,
        itemCount: reviews.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  static async upsertReview(userId: string, storyId: string, data: ReviewInput) {
    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) {
      throw new Error('Không tìm thấy truyện');
    }

    const review = await prisma.$transaction(async (tx) => {
      // Create or update review
      const upsertedReview = await tx.review.upsert({
        where: {
          userId_storyId: {
            userId,
            storyId,
          },
        },
        update: {
          ratingScore: data.ratingScore,
          content: data.content,
          updatedAt: new Date(),
        },
        create: {
          userId,
          storyId,
          ratingScore: data.ratingScore,
          content: data.content,
        },
      });

      // Recalculate average rating and total reviews for the story
      const aggregates = await tx.review.aggregate({
        where: { storyId },
        _avg: { ratingScore: true },
        _count: { id: true },
      });

      const avg = aggregates._avg.ratingScore || 0;
      const count = aggregates._count.id;

      await tx.story.update({
        where: { id: storyId },
        data: {
          averageRating: Number(avg.toFixed(1)),
          reviewCount: count,
        },
      });

      return upsertedReview;
    });

    // Gửi thông báo cho tác giả nếu người đánh giá không phải tác giả
    if (story.uploaderId !== userId) {
      await NotificationService.createAndSendNotification(
        story.uploaderId,
        userId,
        'STORY',
        storyId,
        'REVIEW',
        `đã đánh giá ${data.ratingScore} sao cho truyện "${story.title}".`
      );
    }

    return review;
  }

  static async deleteReview(userId: string, storyId: string, role: string) {
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_storyId: {
          userId,
          storyId,
        },
      },
    });

    if (!existingReview) {
      throw new Error('Bạn chưa đánh giá truyện này');
    }

    if (existingReview.userId !== userId && role !== 'admin') {
      throw new Error('Bạn không có quyền xóa đánh giá này');
    }

    await prisma.$transaction(async (tx) => {
      await tx.review.delete({
        where: { id: existingReview.id },
      });

      // Recalculate average rating and total reviews
      const aggregates = await tx.review.aggregate({
        where: { storyId },
        _avg: { ratingScore: true },
        _count: { id: true },
      });

      const avg = aggregates._avg.ratingScore || 0;
      const count = aggregates._count.id;

      await tx.story.update({
        where: { id: storyId },
        data: {
          averageRating: Number(avg.toFixed(1)),
          reviewCount: count,
        },
      });
    });

    return { message: 'Đã xóa đánh giá thành công' };
  }
}
