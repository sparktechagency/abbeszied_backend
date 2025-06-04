import { z } from 'zod';

const workHistoryValidationSchema = z.object({
  body: z.object({
    companyName: z.string({
      required_error: 'Company name is required',
    }),
    designation: z.string({
      required_error: 'Designation is required',
    }),
    startDate: z.string({
      required_error: 'Start date is required',
    }),
    endDate: z.string({
      required_error: 'End date is required',
    }),
  }),
});

const certificateValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
  }),
});

export const experienceValidation = {
  workHistoryValidationSchema,
  certificateValidationSchema,
};