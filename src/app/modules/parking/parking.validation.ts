import { z } from 'zod';

// Define the validation schema for creating a field
const createFieldZodValidationSchema = z.object({
  body: z.object({
    fieldId: z.string({
      required_error: 'field Id is required!',
    }),
    courtName: z.string({
      required_error: 'Court name Id is required!',
    }),
    blockStartTime: z.string({
      required_error: 'Block Start  time is required!',
    }),
    blockEndTime: z.string({
      required_error: 'Block end time is required!',
    }),
    courtPrice: z.string({
      required_error: 'Court Price is required!',
    }),
    courtType: z.string({
      required_error: 'Court type is required!',
    }),
    description: z.string({
      required_error: 'description is required!',
    }),
  }),
});

// Export the schema
export const fieldValidation = {
  createFieldZodValidationSchema,
};
