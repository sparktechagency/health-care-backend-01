import { z } from 'zod';

const createNotificationZodSchema = z.object({
  body: z.object({
    title: z
      .string({ invalid_type_error: 'title should be type string' })
      .optional(),
    description: z.string({
      required_error: 'description is required',
      invalid_type_error: 'description should be type string',
    }),
    meetingLink: z.string({
      required_error: 'meetingLink is required',
      invalid_type_error: 'meetingLink should be type  string',
    }),
    reciever: z.string({
      required_error: 'reciever is required',
      invalid_type_error: 'reciever should be type objectID or string',
    }),
  }),
});

const updateNotificationZodSchema = z.object({
  body: z.object({
    title: z
      .string({ invalid_type_error: 'title should be type string' })
      .optional(),
    description: z
      .string({ invalid_type_error: 'description should be type string' })
      .optional(),
    reciever: z
      .string({ invalid_type_error: 'reciever should be type string' })
      .optional(),
    status: z
      .string({ invalid_type_error: 'status should be type string' })
      .optional(),
  }),
});

export const NotificationValidation = {
  createNotificationZodSchema,
  updateNotificationZodSchema,
};
