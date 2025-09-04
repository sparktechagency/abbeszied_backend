"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Item Schema Definition
const productsSchema = new mongoose_1.Schema({
    sellerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    buyerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        default: null,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    condition: {
        type: String,
        required: true,
    },
    isDeleted: { type: Boolean, default: false },
    images: { type: [String], required: true },
    status: {
        type: String,
        enum: ['available', 'sold'],
        default: 'available',
    },
    isApproved: {
        type: String,
        enum: ['approved', 'pending', 'rejected'],
        default: 'pending',
    },
}, {
    timestamps: true,
});
// Query Middleware
productsSchema.pre('find', function (next) {
    this.find({ isDeleted: { $ne: true } });
    next();
});
productsSchema.pre('findOne', function (next) {
    this.find({ isDeleted: { $ne: true } });
    next();
});
productsSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
    next();
});
const Product = (0, mongoose_1.model)('Product', productsSchema);
exports.default = Product;
