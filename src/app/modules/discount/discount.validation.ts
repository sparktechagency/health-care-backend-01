import { z } from 'zod';

const createDiscountZodSchema = z.object({
  body: z.object({
    country: z.array(
      z.string({
        required_error: 'Each country must be a string',
        invalid_type_error: 'Each country should be type string',
      })
    ).nonempty({
      message: 'At least one country is required',
    }),
//     country: z.array(
//   z.string({
//     required_error: 'Each country must be a string',
//     invalid_type_error: 'Each country should be type string',
//   })
// ).nonempty({
//   message: 'At least one country is required',
// }),

    name: z.string({
      required_error: 'name is required',
      invalid_type_error: 'name should be type string',
    }),
    startDate: z.string({
      required_error: 'startDate is required',
      invalid_type_error: 'startDate should be type string',
    }),
    endDate: z.string({
      required_error: 'endDate is required',
      invalid_type_error: 'endDate should be type string',
    }),
    discountCode: z.string({
      required_error: 'discountCode is required',
      invalid_type_error: 'discountCode should be type String',
    }),
    
  }),
});

const updateDiscountZodSchema = z.object({
  body: z.object({
    country: z
      .string({ invalid_type_error: 'country should be type string' })
      .optional(),
    name: z
      .string({ invalid_type_error: 'name should be type string' })
      .optional(),
    code: z
      .string({ invalid_type_error: 'code should be type string' })
      .optional(),
    startDate: z
      .string({ invalid_type_error: 'startDate should be type string' })
      .optional(),
    endDate: z
      .string({ invalid_type_error: 'endDate should be type string' })
      .optional(),
    amount: z
      .number({ invalid_type_error: 'amount should be type number' })
      .optional(),
  }),
});

export const DiscountValidation = {
  createDiscountZodSchema,
  updateDiscountZodSchema,
};
