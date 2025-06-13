import { z } from 'zod';
        
  const createSubscriberZodSchema = z.object({
    body: z.object({
      email: z.string({ required_error:"email is required", invalid_type_error:"email should be type string" })
    }),
  });
  
  const updateSubscriberZodSchema = z.object({
    body: z.object({
      email: z.string({ invalid_type_error:"email should be type string" }).optional()
    }),
  });
  
  export const SubscriberValidation = {
    createSubscriberZodSchema,
    updateSubscriberZodSchema
  };
