import { z } from 'zod';
import { GENDER } from '../../../../enums/user';

const createPharmecyZodSchema = z.object({
  body: z.object({
    pharmecyName: z.string({ required_error: 'Pharmecy Name is required' }),
    contact: z.string({ required_error: 'Contact is required' }),
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
    location: z.string({ required_error: 'Location is required' }),
    profile: z.string().optional(),
  }),
});

export const PharmecyValidation = {
  createPharmecyZodSchema,
};
