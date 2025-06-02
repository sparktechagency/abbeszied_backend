import { z } from 'zod';
import { USER_ROLE } from './user.constants';

const userValidationSchema = z.object({
  body: z.object({
    fullName: z.string().min(1, { message: 'Full name is required' }),
    email: z.string().email({ message: 'Invalid email format' }),
    role: z
      .nativeEnum(USER_ROLE, {
        message: 'Role must be a valid user role',
      })
      .optional(),
    phone: z
      .string()
      .min(1, { message: 'Phone name is string value' })
      .optional(),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' }),
  }),
});

const userupdateValidationSchema = z.object({
  body: z
    .object({
      fullName: z
        .string()
        .min(1, { message: 'Full name is string value' })
        .optional(),
      phone: z
        .string()
        .min(1, { message: 'Phone name is string value' })
        .optional(),
    })
    .optional(),
});

export const userValidation = {
  userValidationSchema,
  userupdateValidationSchema,
};
