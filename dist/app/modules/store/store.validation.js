"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductValidation = exports.productValidationSchema = void 0;
const zod_1 = require("zod");
exports.productValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, { message: 'Title is required' }),
        price: zod_1.z.string().min(0.01, { message: 'Price must be greater than 0' }),
        category: zod_1.z.string().min(1, { message: 'Category is required' }),
        description: zod_1.z.string().min(1, { message: 'Description is required' }),
        location: zod_1.z.string().min(1, { message: 'Location is required' }),
        condition: zod_1.z.string(),
    }),
});
exports.ProductValidation = { productValidationSchema: exports.productValidationSchema };
