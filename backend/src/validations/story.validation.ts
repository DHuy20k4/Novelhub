import { z } from 'zod';

export const getStoriesQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).default(12),
  categories: z.string().optional(), // VD: "action,romance"
  sortBy: z.enum(['newest', 'updated', 'topView', 'topRate']).default('newest'),
});

export const createStorySchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  summary: z.string().optional(),
  coverUrl: z.string().url().optional(),
  categoryIds: z.array(z.string().uuid()).min(1, "Truyện phải có ít nhất 1 thể loại"),
});

export const updateStorySchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  summary: z.string().optional(),
  coverUrl: z.string().url().optional(),
  moderationStatus: z.enum(['draft', 'published', 'rejected']).optional(),
  writingStatus: z.enum(['ongoing', 'completed', 'dropped']).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
}).strict();

export type GetStoriesQuery = z.infer<typeof getStoriesQuerySchema>;
export type CreateStoryInput = z.infer<typeof createStorySchema>;
export type UpdateStoryInput = z.infer<typeof updateStorySchema>;
