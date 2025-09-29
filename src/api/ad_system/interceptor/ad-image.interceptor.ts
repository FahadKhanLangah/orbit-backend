import { FileInterceptor } from "@nestjs/platform-express";
import { BadRequestException } from "@nestjs/common";

// Define the allowed image types for ads
const adImageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

export const adImageInterceptor = FileInterceptor('adImage', { // The field name is 'adImage'
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for ad images
  },
  fileFilter: (req, file, cb) => {
    if (!adImageMimeTypes.includes(file.mimetype)) {
      return cb(new BadRequestException('Image extension not allowed (only JPG, PNG, GIF)'), false);
    }
    return cb(null, true);
  },
});