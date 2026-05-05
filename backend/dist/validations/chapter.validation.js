"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChapterSchema = exports.createChapterSchema = void 0;
const zod_1 = require("zod");
exports.createChapterSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(255),
    content: zod_1.z.string().min(1),
    chapterIndex: zod_1.z.number().positive(),
});
exports.updateChapterSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(255).optional(),
    content: zod_1.z.string().min(1).optional(),
    chapterIndex: zod_1.z.number().positive().optional(),
}).strict();
