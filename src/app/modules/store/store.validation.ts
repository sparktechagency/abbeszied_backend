import { z } from 'zod';

export const productValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, { message: 'Title is required' }),
    price: z.string().min(0.01, { message: 'Price must be greater than 0' }),
    category: z.string().min(1, { message: 'Category is required' }),
    description: z.string().min(1, { message: 'Description is required' }),
    location: z.string().min(1, { message: 'Location is required' }),
    condition: z.string(),
  }),
});

export const ProductValidation = { productValidationSchema };
