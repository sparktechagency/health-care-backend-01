import { z } from 'zod';

const createReviewZodSchema = z.object({
  body: z.object({
    description: z.string({
      required_error: 'description is required',
      invalid_type_error: 'description should be type string',
    }),
  }),
});

const updateReviewZodSchema = z.object({
  body: z.object({
    description: z
      .string({ invalid_type_error: 'description should be type string' })
      .optional(),
  }),
});

export const ReviewValidation = {
  createReviewZodSchema,
  updateReviewZodSchema,
};
