"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gallery = void 0;
// ============= GALLERY.INTERFACE.TS =============
const mongoose_1 = require("mongoose");
// Image subdocument schema
const imageSubSchema = new mongoose_1.Schema({
    url: {
        type: String,
        required: [true, 'Image URL is required'],
        trim: true,
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    }
}, {
    _id: true // Ensures each subdocument gets an _id automatically
});
// Main Gallery schema
const gallerySchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true,
    },
    images: {
        type: [imageSubSchema],
        required: true,
        default: []
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.__v;
            return ret;
        }
    }
});
// Create indexes for better performance
gallerySchema.index({ userId: 1, createdAt: -1 });
gallerySchema.index({ "images._id": 1 });
// Export the model
exports.Gallery = (0, mongoose_1.model)('Gallery', gallerySchema);
