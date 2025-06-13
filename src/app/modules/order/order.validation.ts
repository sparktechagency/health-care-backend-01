import { z } from 'zod';

const createOrderZodSchema = z.object({
  body: z.object({
    trackingNo: z.string({
      required_error: 'trackingNo is required',
      invalid_type_error: 'trackingNo should be type string',
    }),
    user: z.string({
      required_error: 'user is required',
      invalid_type_error: 'user should be type objectID or string',
    }),
    orderDate: z
      .string({ invalid_type_error: 'orderDate should be type Date' })
      .optional(),
    price: z.number({
      required_error: 'price is required',
      invalid_type_error: 'price should be type number',
    }),
    status: z
      .string({ invalid_type_error: 'status should be type string' })
      .optional(),
  }),
});

const updateOrderZodSchema = z.object({
  body: z.object({
    trackingNo: z
      .string({ invalid_type_error: 'trackingNo should be type string' })
      .optional(),
    user: z
      .string({ invalid_type_error: 'user should be type string' })
      .optional(),
    orderDate: z
      .string({ invalid_type_error: 'orderDate should be type Date' })
      .optional(),
    price: z
      .number({ invalid_type_error: 'price should be type number' })
      .optional(),
    status: z
      .string({ invalid_type_error: 'status should be type string' })
      .optional(),
  }),
});

export const OrderValidation = {
  createOrderZodSchema,
  updateOrderZodSchema,
};
