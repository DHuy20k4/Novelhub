"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUsersSchema = exports.updateUserSchema = void 0;
const zod_1 = require("zod");
exports.updateUserSchema = zod_1.z.object({
    displayName: zod_1.z.string().min(1).max(100).optional(),
    avatarUrl: zod_1.z.string().url().max(255).optional(),
}).strict();
exports.searchUsersSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).default(1),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).default(10),
});
