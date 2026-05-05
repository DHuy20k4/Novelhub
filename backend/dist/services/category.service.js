"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const prisma_util_1 = __importDefault(require("../utils/prisma.util"));
class CategoryService {
    static async getAllCategories() {
        // Lấy tất cả category và đếm số lượng truyện thuộc category đó (tùy chọn)
        const categories = await prisma_util_1.default.category.findMany({
            orderBy: {
                name: 'asc',
            },
            include: {
                _count: {
                    select: { stories: true },
                },
            },
        });
        return categories;
    }
}
exports.CategoryService = CategoryService;
