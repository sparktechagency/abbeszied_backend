"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userValidation = void 0;
const zod_1 = require("zod");
const user_constants_1 = require("./user.constants");
const userValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        fullName: zod_1.z.string().min(1, { message: 'Full name is required' }),
        email: zod_1.z.string().email({ message: 'Invalid email format' }),
        role: zod_1.z
            .nativeEnum(user_constants_1.USER_ROLE, {
            message: 'Role must be a valid user role',
        })
            .optional(),
        phone: zod_1.z
            .string()
            .min(1, { message: 'Phone name is string value' })
            .optional(),
        password: zod_1.z
            .string()
            .min(6, { message: 'Password must be at least 6 characters long' }),
    }),
});
const userupdateValidationSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        fullName: zod_1.z
            .string()
            .min(1, { message: 'Full name is string value' })
            .optional(),
        phone: zod_1.z
            .string()
            .min(1, { message: 'Phone name is string value' })
            .optional(),
    })
        .optional(),
});
exports.userValidation = {
    userValidationSchema,
    userupdateValidationSchema,
};
