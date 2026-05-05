"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStorySchema = exports.createStorySchema = exports.getStoriesQuerySchema = void 0;
const zod_1 = require("zod");
exports.getStoriesQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).default(1),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).default(12),
    categories: zod_1.z.string().optional(), // VD: "action,romance"
    sortBy: zod_1.z.enum(['newest', 'updated', 'topView', 'topRate']).default('newest'),
});
exports.createStorySchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(255),
    slug: zod_1.z.string().min(1).max(255),
    summary: zod_1.z.string().optional(),
    coverUrl: zod_1.z.string().url().optional(),
    categoryIds: zod_1.z.array(zod_1.z.string().uuid()).min(1, "Truyện phải có ít nhất 1 thể loại"),
});
exports.updateStorySchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(255).optional(),
    slug: zod_1.z.string().min(1).max(255).optional(),
    summary: zod_1.z.string().optional(),
    coverUrl: zod_1.z.string().url().optional(),
    moderationStatus: zod_1.z.enum(['draft', 'published', 'rejected']).optional(),
    writingStatus: zod_1.z.enum(['ongoing', 'completed', 'dropped']).optional(),
    categoryIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
}).strict();
