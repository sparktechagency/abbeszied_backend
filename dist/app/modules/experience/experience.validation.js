"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.experienceValidation = void 0;
const zod_1 = require("zod");
const workHistoryValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        companyName: zod_1.z.string({
            required_error: 'Company name is required',
        }),
        designation: zod_1.z.string({
            required_error: 'Designation is required',
        })
    }),
});
const certificateValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().optional(),
    }),
});
exports.experienceValidation = {
    workHistoryValidationSchema,
    certificateValidationSchema,
};
