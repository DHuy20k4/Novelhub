import { Request, Response } from 'express';
import { uploadBufferToCloudinary } from '../utils/cloudinary.util';

export const uploadImage = async (req: Request, res: Response) => {
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

    const imageUrl = await uploadBufferToCloudinary(req.file.buffer, folder);

    res.status(200).json({
      success: true,
      message: 'Upload thành công!',
      data: {
        imageUrl,
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi upload ảnh lên Cloudinary',
      error: error.message,
    });
  }
};
