"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobPostValidation = void 0;
const zod_1 = require("zod");
const createJobPostZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        jobTitle: zod_1.z.string({
            required_error: 'Job title is required',
        }),
        location: zod_1.z.string({
            required_error: 'Location is required',
        }),
        jobCategory: zod_1.z.string({
            required_error: 'Job category is required',
        }),
        jobType: zod_1.z.string({
            required_error: 'Job type is required',
        }),
        jobDescription: zod_1.z.string({
            required_error: 'Job description is required',
        }),
        qualifications: zod_1.z.array(zod_1.z.string({
            required_error: 'Qualification is required',
        })),
        experience: zod_1.z.string({
            required_error: 'Experience is required',
        }),
        salary: zod_1.z.object({
            min: zod_1.z.number({
                required_error: 'Minimum salary is required',
            }),
            max: zod_1.z.number({
                required_error: 'Maximum salary is required',
            }),
            currency: zod_1.z.string({
                required_error: 'Currency is required',
            }),
        }),
        benefits: zod_1.z.array(zod_1.z.string({
            required_error: 'Benefit is required',
        })),
        howToApply: zod_1.z.string({
            required_error: 'Application instructions are required',
        }),
        deadline: zod_1.z.string({
            required_error: 'Deadline is required',
        }),
    }),
});
const updateJobPostZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        jobTitle: zod_1.z.string().optional(),
        location: zod_1.z.string().optional(),
        jobCategory: zod_1.z.string().optional(),
        jobType: zod_1.z.string().optional(),
        jobDescription: zod_1.z.string().optional(),
        qualifications: zod_1.z.array(zod_1.z.string()).optional(),
        experience: zod_1.z.string().optional(),
        salary: zod_1.z.object({
            min: zod_1.z.number().optional(),
            max: zod_1.z.number().optional(),
            currency: zod_1.z.string().optional(),
        }).optional(),
        benefits: zod_1.z.array(zod_1.z.string()).optional(),
        howToApply: zod_1.z.string().optional(),
        deadline: zod_1.z.string().optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
exports.JobPostValidation = {
    createJobPostZodSchema,
    updateJobPostZodSchema,
};
