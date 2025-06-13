import { z } from 'zod';

const createInfoZodSchema = z.object({
  body: z.object({
    name: z
      .string({
        invalid_type_error: 'name should be type string',
      })
      .optional(),
    description: z.string({
      required_error: 'description is required',
      invalid_type_error: 'description should be type string',
    }),
  }),
});

const updateInfoZodSchema = z.object({
  body: z.object({
    name: z
      .string({ invalid_type_error: 'name should be type string' })
      .optional(),
    description: z
      .string({ invalid_type_error: 'description should be type string' })
      .optional(),
  }),
});

export const InfoValidation = {
  createInfoZodSchema,
  updateInfoZodSchema,
};
