import { z } from 'zod';

export const reviewSchema = z.object({
  ratingScore: z.number().int().min(1).max(5),
  content: z.string().max(2000).optional(),
});

export const getReviewsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).default(10),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
export type GetReviewsQuery = z.infer<typeof getReviewsQuerySchema>;
