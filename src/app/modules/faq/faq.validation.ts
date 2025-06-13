import { z } from 'zod';

const createFaqZodSchema = z.object({
  body: z.object({
    question: z.string({
      required_error: 'question is required',
      invalid_type_error: 'question should be type string',
    }),
    answer: z.string({
      required_error: 'answer is required',
      invalid_type_error: 'answer should be type string',
    }),
  }),
});

const updateFaqZodSchema = z.object({
  body: z.object({
    question: z
      .string({ invalid_type_error: 'question should be type string' })
      .optional(),
    answer: z
      .string({ invalid_type_error: 'answer should be type string' })
      .optional(),
  }),
});

export const FaqValidation = {
  createFaqZodSchema,
  updateFaqZodSchema,
};
