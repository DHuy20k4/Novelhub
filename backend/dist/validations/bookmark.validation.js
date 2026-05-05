"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleBookmarkSchema = void 0;
const zod_1 = require("zod");
exports.toggleBookmarkSchema = zod_1.z.object({
    storyId: zod_1.z.string().uuid({ message: 'ID truyện không hợp lệ' }),
});
