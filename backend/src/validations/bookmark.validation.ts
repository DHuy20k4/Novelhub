import { z } from 'zod';

export const toggleBookmarkSchema = z.object({
  storyId: z.string().uuid({ message: 'ID truyện không hợp lệ' }),
});

export type ToggleBookmarkInput = z.infer<typeof toggleBookmarkSchema>;
