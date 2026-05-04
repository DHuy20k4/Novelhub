import { z } from 'zod';

export const createCommentSchema = z.object({
  storyId: z.string().uuid(),
  chapterId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  content: z.string().min(1).max(2000),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
}).strict();

export const getCommentsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).default(10),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type GetCommentsQuery = z.infer<typeof getCommentsQuerySchema>;
