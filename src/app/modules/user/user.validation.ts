import { z } from 'zod';
import { GENDER } from '../../../enums/user';

const createUserZodSchema = z.object({
  body: z.object({
    firstName: z.string({ required_error: 'First Name is required' }),
    lastName: z.string({ required_error: 'Last Name is required' }),
    contact: z.string({ required_error: 'Contact is required' }),
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
    location: z.string({ required_error: 'Location is required' }),
    gender: z.enum([GENDER.MALE, GENDER.FEMALE, GENDER.OTHER], {
      required_error: 'Gender is required',
    }),
    dateOfBirth: z.string().optional(),
    profile: z.string().optional(),
    city: z.string().optional(),
    postCode: z.string().optional(),
    country: z.string().optional(),
  }),
});

export const UserValidation = {
  createUserZodSchema,
};
