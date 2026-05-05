"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const cloudinary_util_1 = require("../utils/cloudinary.util");
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Không tìm thấy file ảnh đính kèm!',
            });
        }
        // Determine folder based on context (e.g. avatar or cover)
        // Could pass this in the query or body: ?type=avatar
        const type = req.body.type || req.query.type || 'misc';
        const folder = `web_novelhub/${type}`;
        const imageUrl = await (0, cloudinary_util_1.uploadBufferToCloudinary)(req.file.buffer, folder);
        res.status(200).json({
            success: true,
            message: 'Upload thành công!',
            data: {
                imageUrl,
            },
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi upload ảnh lên Cloudinary',
            error: error.message,
        });
    }
};
exports.uploadImage = uploadImage;
