"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingValidation = void 0;
const zod_1 = require("zod");
const createBookingSchema = zod_1.z.object({
    body: zod_1.z.object({
        coachId: zod_1.z.string().min(1, 'Coach ID is required'),
        sessionId: zod_1.z.string().min(1, 'Session ID is required'),
        selectedDay: zod_1.z.string().min(1, 'Selected day is required'),
        startTime: zod_1.z.string().min(1, 'Start time is required'),
        endTime: zod_1.z.string().min(1, 'End time is required'),
        price: zod_1.z.number().positive('Price must be positive'),
    }),
});
const cancelBookingSchema = zod_1.z.object({
    body: zod_1.z.object({
        reason: zod_1.z.string().optional(),
    }),
});
const rescheduleBookingSchema = zod_1.z.object({
    body: zod_1.z.object({
        newSelectedDay: zod_1.z.string({
            required_error: 'New selected day is required',
        }),
        newStartTime: zod_1.z.string({
            required_error: 'New start time is required',
        }),
        newEndTime: zod_1.z.string({
            required_error: 'New end time is required',
        }),
        reason: zod_1.z.string().optional(),
    }),
});
exports.bookingValidation = {
    createBookingSchema,
    cancelBookingSchema,
    rescheduleBookingSchema,
};
