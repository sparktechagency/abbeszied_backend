import { z } from 'zod';

// Define the validation schema for creating a field
const courtBookingZodValidationSchema = z.object({
  body: z.object({
    courtId: z.string({
      required_error: 'Court Id is required!',
    }),
    bookingPrice: z.number({
      required_error: 'Booking price is required!',
    }),
    bookingDate: z.string({
      required_error: 'Booking date is required!',
    }),
    bookingStartTime: z.string({
      required_error: 'Booking start time is required!',
    }),

    // duration: z.number({
    //   required_error: 'Duration   is required!',
    // }),
  }),
});

// Export the schema
export const courtBookingValidation = {
  courtBookingZodValidationSchema,
};
