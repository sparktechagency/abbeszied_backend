import { z } from 'zod';

const verifyRuleZodSchema = z.object({
  body: z.object({
    text: z.string({ required_error: 'Text is required' }),
  }),
});

export const resentRuleValidations = {
  verifyRuleZodSchema,
};
