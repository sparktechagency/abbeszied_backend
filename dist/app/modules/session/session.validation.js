"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionValidation = void 0;
const zod_1 = require("zod");
// Time validation for both 12-hour and 24-hour formats
const timeFormatRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$|^([0-1]?[0-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)$/;
const timeSlotSchema = zod_1.z.object({
    startTime: zod_1.z.string().regex(timeFormatRegex, {
        message: 'Start time must be in HH:MM format (24-hour) or HH:MM AM/PM format (12-hour)',
    }),
    isBooked: zod_1.z.boolean().optional().default(false),
});
const createSessionValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        pricePerSession: zod_1.z.number().positive({
            message: 'Price per session must be a positive number',
        }),
        selectedDay: zod_1.z.union([
            zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
                message: 'Selected day must be a valid date',
            }),
            zod_1.z.array(zod_1.z.string().min(1, {
                message: 'Day name cannot be empty',
            })).min(1, {
                message: 'At least one day must be provided',
            })
        ]),
        timeSlots: zod_1.z.array(timeSlotSchema).min(1, {
            message: 'At least one time slot is required',
        }),
        language: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
const updateSessionValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        pricePerSession: zod_1.z
            .number()
            .positive({
            message: 'Price per session must be a positive number',
        })
            .optional(),
        timeSlots: zod_1.z
            .array(timeSlotSchema)
            .min(1, {
            message: 'At least one time slot is required',
        })
            .optional(),
        language: zod_1.z.array(zod_1.z.string()).optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
const bookTimeSlotValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        coachId: zod_1.z.string().min(1, {
            message: 'Coach ID is required',
        }),
        selectedDay: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Selected day must be a valid date',
        }),
        startTime: zod_1.z.string().regex(timeFormatRegex, {
            message: 'Start time must be in HH:MM format (24-hour) or HH:MM AM/PM format (12-hour)',
        }),
    }),
});
const dateRangeValidationSchema = zod_1.z.object({
    query: zod_1.z.object({
        coachId: zod_1.z.string().min(1, {
            message: 'Coach ID is required',
        }),
        startDate: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Start date must be a valid date',
        }),
        endDate: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'End date must be a valid date',
        }),
    }),
});
exports.sessionValidation = {
    createSessionValidationSchema,
    updateSessionValidationSchema,
    bookTimeSlotValidationSchema,
    dateRangeValidationSchema,
};
