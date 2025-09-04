"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportValidation = void 0;
const zod_1 = require("zod");
const warningReportZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        message: zod_1.z.string({
            required_error: 'Message is required',
        }),
    }),
});
exports.ReportValidation = {
    warningReportZodSchema,
};
