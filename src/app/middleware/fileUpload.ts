import { Request } from 'express';
import fs from 'fs';
import multer from 'multer';

const fileUpload = (uploadDirectory: string) => {
  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req: Request, file, cb) {
      cb(null, uploadDirectory);
    },
    filename: function (req: Request, file, cb) {
      const parts = file.originalname.split('.');
      let extension = '';
      if (parts.length > 1) {
        extension = '.' + parts.pop();
      }
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(
        null,
        parts.shift()!.replace(/\s+/g, '_') + '-' + uniqueSuffix + extension,
      );
    },
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: function (req: Request, file, cb) {
      const allowedMimeTypes = [
        'image/png',
        'image/jpg',
        'image/jpeg',
        'image/svg+xml',
        'image/webp',
        'application/pdf',
        // Add video mime types
        'video/mp4',
        'video/mpeg',
        'video/quicktime', // .mov
        'video/x-msvideo', // .avi
        'video/webm',
        'application/octet-stream',
      ];

      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            'Invalid file type. Only images, videos, and PDFs are allowed.',
          ),
        );
      }
    },
  });

  return {
    // Single file upload
    single: (fieldName: string) => upload.single(fieldName),

    // Multiple files with same field name
    array: (fieldName: string, maxCount: number = 10) =>
      upload.array(fieldName, maxCount),

    // Multiple files with different field names
    fields: (fields: { name: string; maxCount?: number }[]) =>
      upload.fields(fields),

    // Any files
    any: () => upload.any(),
  };
};

export default fileUpload;
