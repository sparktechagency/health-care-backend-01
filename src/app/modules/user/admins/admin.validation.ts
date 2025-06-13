import { z } from 'zod';
import { GENDER } from '../../../../enums/user';

const createAdminZodSchema = z.object({
  body: z.object({
    firstName: z.string({ required_error: 'First Name is required' }),
    lastName: z.string({ required_error: 'Last Name is required' }),
    contact: z.string({ required_error: 'Contact is required' }),
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),

    profile: z.string().optional(),
  }),
});

export const AdminValidation = {
  createAdminZodSchema,
};
