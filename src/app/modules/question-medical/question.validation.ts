import { z } from 'zod';

const createQuestionZodSchema = z.object({
  body: z.object({
    question: z.string({
      required_error: 'question is required',
      invalid_type_error: 'question should be type string',
    }),
    subCategory: z.string({
      required_error: 'subCategory is required',
      invalid_type_error: 'subCategory should be type objectID or string',
    }),
  }),
});

const updateQuestionZodSchema = z.object({
  body: z.object({
    question: z
      .string({ invalid_type_error: 'question should be type string' })
      .optional(),
    subCategory: z
      .string({ invalid_type_error: 'subCategory should be type string' })
      .optional(),
  }),
});

export const QuestionValidation = {
  createQuestionZodSchema,
  updateQuestionZodSchema,
};
