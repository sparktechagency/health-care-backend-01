import { z } from 'zod';
        
  const createShippingDetailsZodSchema = z.object({
    body: z.object({
      pharmecy: z.string({ required_error:"pharmecy is required", invalid_type_error:"pharmecy should be type objectID or string" }),
      selectedArea: z.string({ required_error:"selectedArea is required", invalid_type_error:"selectedArea should be type string" }),
      shippingPrice: z.number({ required_error:"shippingPrice is required", invalid_type_error:"shippingPrice should be type number" })
    }),
  });
  
  const updateShippingDetailsZodSchema = z.object({
    body: z.object({
      pharmecy: z.string({ invalid_type_error:"pharmecy should be type string" }).optional(),
      selectedArea: z.string({ invalid_type_error:"selectedArea should be type string" }).optional(),
      shippingPrice: z.number({ invalid_type_error:"shippingPrice should be type number" }).optional()
    }),
  });
  
  export const ShippingDetailsValidation = {
    createShippingDetailsZodSchema,
    updateShippingDetailsZodSchema
  };
