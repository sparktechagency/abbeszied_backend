import { z } from 'zod';

const createBookingSchema = z.object({
  body: z.object({
    coachId: z.string().min(1, 'Coach ID is required'),
    sessionId: z.string().min(1, 'Session ID is required'),
    selectedDay: z.string().min(1, 'Selected day is required'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    price: z.number().positive('Price must be positive'),
  }),
});

const cancelBookingSchema = z.object({
  body: z.object({
    reason: z.string().optional(),
  }),
});
const rescheduleBookingSchema = z.object({
    body: z.object({
      newSelectedDay: z.string({
        required_error: 'New selected day is required',
      }),
      newStartTime: z.string({
        required_error: 'New start time is required',
      }),
      newEndTime: z.string({
        required_error: 'New end time is required',
      }),
      reason: z.string().optional(),
    }),
  });
export const bookingValidation = {
  createBookingSchema,
  cancelBookingSchema,
  rescheduleBookingSchema,
};