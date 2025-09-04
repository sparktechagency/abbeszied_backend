"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminValidation = void 0;
const zod_1 = require("zod");
const createAdminZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        fullName: zod_1.z.string({ required_error: 'Name is required' }),
        email: zod_1.z.string({ required_error: 'Email is required' }),
        password: zod_1.z.string({ required_error: 'Password is required' }),
    }),
});
exports.AdminValidation = {
    createAdminZodSchema,
};
