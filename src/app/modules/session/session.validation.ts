import { z } from 'zod';

// Time validation for both 12-hour and 24-hour formats
const timeFormatRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$|^([0-1]?[0-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)$/;

const timeSlotSchema = z.object({
  startTime: z.string().regex(timeFormatRegex, {
    message: 'Start time must be in HH:MM format (24-hour) or HH:MM AM/PM format (12-hour)',
  }),
  isBooked: z.boolean().optional().default(false),
});

const createSessionValidationSchema = z.object({
  body: z.object({
    pricePerSession: z.number().positive({
      message: 'Price per session must be a positive number',
    }),
    selectedDay: z.union([
      z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Selected day must be a valid date',
      }),
      z.array(z.string().min(1, {
        message: 'Day name cannot be empty',
      })).min(1, {
        message: 'At least one day must be provided',
      })
    ]),
    timeSlots: z.array(timeSlotSchema).min(1, {
      message: 'At least one time slot is required',
    }),
    language: z.array(z.string()).optional(),
  }),
});

const updateSessionValidationSchema = z.object({
  body: z.object({
    pricePerSession: z
      .number()
      .positive({
        message: 'Price per session must be a positive number',
      })
      .optional(),
    timeSlots: z
      .array(timeSlotSchema)
      .min(1, {
        message: 'At least one time slot is required',
      })
      .optional(),
    language: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
});

const bookTimeSlotValidationSchema = z.object({
  body: z.object({
    coachId: z.string().min(1, {
      message: 'Coach ID is required',
    }),
    selectedDay: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Selected day must be a valid date',
    }),
    startTime: z.string().regex(timeFormatRegex, {
      message: 'Start time must be in HH:MM format (24-hour) or HH:MM AM/PM format (12-hour)',
    }),
  }),
});

const dateRangeValidationSchema = z.object({
  query: z.object({
    coachId: z.string().min(1, {
      message: 'Coach ID is required',
    }),
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Start date must be a valid date',
    }),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'End date must be a valid date',
    }),
  }),
});

export const sessionValidation = {
  createSessionValidationSchema,
  updateSessionValidationSchema,
  bookTimeSlotValidationSchema,
  dateRangeValidationSchema,
};