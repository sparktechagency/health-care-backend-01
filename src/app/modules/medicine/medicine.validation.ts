// import { z } from 'zod';

// const createMedicineZodSchema = z.object({
//   name: z.string({
//     required_error: 'name is required',
//     invalid_type_error: 'name should be type string',
//   }),
//   company: z.string({
//     required_error: 'company is required',
//     invalid_type_error: 'company should be type string',
//   }),
//   dosage: z.any(),
//   country: z.string({
//     required_error: 'country is required',
//     invalid_type_error: 'country should be type string',
//   }),
//   image: z.string({
//     required_error: 'image is required',
//     invalid_type_error: 'image should be type string',
//   }),
//   unitPerBox: z.any(),

//   form: z.string({
//     required_error: 'from is required',
//     invalid_type_error: 'from should be type string',
//   }),
//   description: z.string({
//     required_error: 'description is required',
//     invalid_type_error: 'description should be type string',
//   }),
//   purchaseCost: z.string({
//     required_error: 'purchaseCost is required',
//     invalid_type_error: 'purchaseCost should be type string',
//   }),
//   tax: z.string({
//     required_error: 'tax is required',
//     invalid_type_error: 'tax should be type string',
//   }),
//   externalExpenses: z.string({
//     required_error: 'externalExpenses is required',
//     invalid_type_error: 'externalExpenses should be type string',
//   }),
//   sellingPrice: z.string({
//     required_error: 'sellingPrice is required',
//     invalid_type_error: 'sellingPrice should be type string',
//   }),
//   addedBy: z.string({
//     required_error: 'addedBy is required',
//     invalid_type_error: 'addedBy should be type objectID or string',
//   }),
//   subCategory: z.string({
//     required_error: 'subCategory is required',
//     invalid_type_error: 'subCategory should be type string',
//   }),
// });

// const updateMedicineZodSchema = z.object({
//   name: z
//     .string({ invalid_type_error: 'name should be type string' })
//     .optional(),
//   company: z
//     .string({ invalid_type_error: 'company should be type string' })
//     .optional(),
//   dosage: z.any(),
//   country: z
//     .string({ invalid_type_error: 'country should be type string' })
//     .optional(),
//   image: z
//     .string({ invalid_type_error: 'image should be type string' })
//     .optional(),
//   unitPerBox: z.any(),

//   form: z
//     .string({ invalid_type_error: 'from should be type string' })
//     .optional(),
//   description: z
//     .string({ invalid_type_error: 'description should be type string' })
//     .optional(),
//   purchaseCost: z
//     .string({ invalid_type_error: 'purchaseCost should be type string' })
//     .optional(),
//   tax: z.string({ invalid_type_error: 'tax should be type string' }).optional(),
//   externalExpenses: z
//     .string({ invalid_type_error: 'externalExpenses should be type string' })
//     .optional(),
//   sellingPrice: z
//     .string({ invalid_type_error: 'sellingPrice should be type string' })
//     .optional(),
//   addedBy: z
//     .string({ invalid_type_error: 'addedBy should be type string' })
//     .optional(),
//   subCategory: z
//     .string({
//       invalid_type_error: 'subCategory should be type string',
//     })
//     .optional(),
// });

// export const MedicineValidation = {
//   createMedicineZodSchema,
//   updateMedicineZodSchema,
// };
import { z } from 'zod';

const unitSchema = z.object({
  unitPerBox: z.string({
    required_error: 'unitPerBox is required',
    invalid_type_error: 'unitPerBox should be type string',
  }),
  // purchaseCost: z.number({
  //   required_error: 'purchaseCost is required',
  //   invalid_type_error: 'purchaseCost should be type number',
  // }),
  // tax: z.number({
  //   required_error: 'tax is required',
  //   invalid_type_error: 'tax should be type number',
  // }),
  // externalExpenses: z.number({
  //   required_error: 'externalExpenses is required',
  //   invalid_type_error: 'externalExpenses should be type number',
  // }),
  sellingPrice: z.number({
    required_error: 'sellingPrice is required',
    invalid_type_error: 'sellingPrice should be type number',
  }),
});

const variationSchema = z.object({
  dosage: z.string({
    required_error: 'dosage is required',
    invalid_type_error: 'dosage should be type string',
  }),
  units: z.array(unitSchema, {
    required_error: 'At least one unit is required for this dosage',
    invalid_type_error: 'Units must be an array',
  }),
});

const createMedicineZodSchema = z.object({
  name: z.string(),
  company: z.string(),
  // country: z.string(),
  country: z.array(z.string()),
  image: z.string(),
  form: z.string(),
  description: z.string(),
  subCategory: z.string(),
  addedBy: z.string(),
  variations: z.array(variationSchema, {
    required_error: 'At least one variation is required',
    invalid_type_error: 'Variations must be an array',
  }),
});

const updateMedicineZodSchema = z.object({
  name: z.string().optional(),
  company: z.string().optional(),
  country: z.string().optional(),
  image: z.string().optional(),
  form: z.string().optional(),
  description: z.string().optional(),
  subCategory: z.string().optional(),
  addedBy: z.string().optional(),
  variations: z.array(variationSchema).optional(),
});

export const MedicineValidation = {
  createMedicineZodSchema,
  updateMedicineZodSchema,
};

