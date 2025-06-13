import { z } from 'zod';

const createSubCategoryZodSchema = z.object({
  name: z.string({
    required_error: 'name is required',
    invalid_type_error: 'name should be type string',
  }),
  category: z.string({
    required_error: 'category is required',
    invalid_type_error: 'category should be type objectID or string',
  }),
  image: z.string({
    required_error: 'image is required',
    invalid_type_error: 'image should be type string',
  }),
  details: z.string({
    required_error: 'details is required',
    invalid_type_error: 'details should be type string',
  }),
});

const updateSubCategoryZodSchema = z.object({
  name: z
    .string({ invalid_type_error: 'name should be type string' })
    .optional(),
  category: z
    .string({ invalid_type_error: 'category should be type string' })
    .optional(),
  image: z
    .string({ invalid_type_error: 'image should be type string' })
    .optional(),
  details: z
    .string({ invalid_type_error: 'details should be type string' })
    .optional(),
});

export const SubCategoryValidation = {
  createSubCategoryZodSchema,
  updateSubCategoryZodSchema,
};
