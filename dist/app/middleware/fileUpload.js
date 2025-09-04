"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const fileUpload = (uploadDirectory) => {
    if (!fs_1.default.existsSync(uploadDirectory)) {
        fs_1.default.mkdirSync(uploadDirectory, { recursive: true });
    }
    const storage = multer_1.default.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadDirectory);
        },
        filename: function (req, file, cb) {
            const parts = file.originalname.split('.');
            let extension = '';
            if (parts.length > 1) {
                extension = '.' + parts.pop();
            }
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, parts.shift().replace(/\s+/g, '_') + '-' + uniqueSuffix + extension);
        },
    });
    const upload = (0, multer_1.default)({
        storage: storage,
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        },
        fileFilter: function (req, file, cb) {
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
            }
            else {
                cb(new Error('Invalid file type. Only images, videos, and PDFs are allowed.'));
            }
        },
    });
    return {
        // Single file upload
        single: (fieldName) => upload.single(fieldName),
        // Multiple files with same field name
        array: (fieldName, maxCount = 10) => upload.array(fieldName, maxCount),
        // Multiple files with different field names
        fields: (fields) => upload.fields(fields),
        // Any files
        any: () => upload.any(),
    };
};
exports.default = fileUpload;
