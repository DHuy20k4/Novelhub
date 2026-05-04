import { z } from 'zod';

export const createChapterSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  chapterIndex: z.number().positive(),
});

export const updateChapterSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  chapterIndex: z.number().positive().optional(),
}).strict();

export type CreateChapterInput = z.infer<typeof createChapterSchema>;
export type UpdateChapterInput = z.infer<typeof updateChapterSchema>;
