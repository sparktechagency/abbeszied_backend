import { z } from 'zod';

const reviewZodSchema = z.object({
  body: z.object({
    rating: z.string({ required_error: 'Rating is required' }),
    comment: z.string().optional(),
  }),
});

export const ReviewValidation = { reviewZodSchema };
