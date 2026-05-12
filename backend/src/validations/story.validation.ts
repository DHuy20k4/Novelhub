import { z } from 'zod';

export const getStoriesQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).default(12),
  categories: z.string().optional(), // VD: "action,romance"
  uploaderId: z.string().uuid().optional(),
  sortBy: z.enum(['newest', 'updated', 'topView', 'topRate']).default('newest'),
  status: z.enum(['draft', 'pending', 'approved', 'rejected']).optional(),
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
  moderationStatus: z.enum(['draft', 'pending', 'approved', 'rejected']).optional(),
  writingStatus: z.enum(['ongoing', 'completed', 'dropped']).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
}).strict();

export type GetStoriesQuery = z.infer<typeof getStoriesQuerySchema>;
export type CreateStoryInput = z.infer<typeof createStorySchema>;
export type UpdateStoryInput = z.infer<typeof updateStorySchema>;
