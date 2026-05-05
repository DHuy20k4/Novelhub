"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommentsQuerySchema = exports.updateCommentSchema = exports.createCommentSchema = void 0;
const zod_1 = require("zod");
exports.createCommentSchema = zod_1.z.object({
    storyId: zod_1.z.string().uuid(),
    chapterId: zod_1.z.string().uuid().optional(),
    parentId: zod_1.z.string().uuid().optional(),
    content: zod_1.z.string().min(1).max(2000),
});
exports.updateCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1).max(2000),
}).strict();
exports.getCommentsQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).default(1),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).default(10),
});
