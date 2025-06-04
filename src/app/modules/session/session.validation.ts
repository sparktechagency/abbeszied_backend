import { z } from 'zod';

const timeSlotValidationSchema = z.object({
  startTime: z.string({
    required_error: 'Start time is required',
  }).regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:mm format'),
  isBooked: z.boolean().optional(),
});

const createSessionValidationSchema = z.object({
  body: z.object({
    pricePerSession: z.number({
      required_error: 'Price per session is required',
    }),
    selectedDay: z.string({
      required_error: 'Selected day is required',
    }),
    timeSlots: z.array(timeSlotValidationSchema, {
      required_error: 'Time slots are required',
    }),
  }),
});

const updateSessionValidationSchema = z.object({
  body: z.object({
    pricePerSession: z.number().optional(),
    selectedDay: z.string().optional(),
    timeSlots: z.array(timeSlotValidationSchema).optional(),
    isActive: z.boolean().optional(),
  }),
});

const bookTimeSlotValidationSchema = z.object({
    body: z.object({
      sessionId: z.string({
        required_error: 'Session ID is required',
      }),
      timeSlotStartTime: z.string({
        required_error: 'Time slot start time is required',
      }).regex(
        /^([0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/,
        'Invalid time format. Use HH:mm format'
      ),
    }),
  });
  

export const sessionValidation = {
  createSessionValidationSchema,
  updateSessionValidationSchema,
  bookTimeSlotValidationSchema,
};