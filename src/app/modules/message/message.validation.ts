import { z } from 'zod';

const createMessageZodSchema = z.object({
  body: z.object({
    type: z.string({
      required_error: 'type is required',
      invalid_type_error: 'type should be type string',
    }),
    name: z.string({
      required_error: 'name is required',
      invalid_type_error: 'name should be type string',
    }),
    phone: z.string({ invalid_type_error: 'phone should be type string' }),
    email: z.string({ invalid_type_error: 'email should be type string' }),
    description: z.string({
      invalid_type_error: 'description should be type string',
    }),
  }),
});

export const MessageValidation = {
  createMessageZodSchema,
};
