import { z } from 'zod';

const createCategoryZodSchema = z.object({
  name: z.string({
    required_error: 'name is required',
    invalid_type_error: 'name should be type string',
  }),
  image: z.string({
    required_error: 'image is required',
    invalid_type_error: 'image should be type string',
  }),
  summary: z.string({
    required_error: 'summary is required',
    invalid_type_error: 'summary should be type string',
  }),
});

const updateCategoryZodSchema = z.object({
  name: z
    .string({ invalid_type_error: 'name should be type string' })
    .optional(),
  image: z
    .string({ invalid_type_error: 'image should be type string' })
    .optional(),
  summary: z
    .string({ invalid_type_error: 'summary should be type string' })
    .optional(),
});

export const CategoryValidation = {
  createCategoryZodSchema,
  updateCategoryZodSchema,
};
