import { z } from 'zod';

const createPostValidationSchema = z.object({
  body: z.object({
    category: z.string({ required_error: 'Post category is required' }),
    description: z
      .string({ invalid_type_error: 'Description must be in string' })
      .min(10, {
        message: 'Description must be at least 10 characters long',
      }),
    isPremium: z.boolean().optional(),
  }),
});

const updatePostValidationSchema = z.object({
  body: z
    .object({
      category: z
        .string({ required_error: 'Post category is required' })
        .optional(),
      description: z
        .string({ invalid_type_error: 'Description must be in string' })
        .min(10, {
          message: 'Description must be at least 10 characters long',
        })
        .optional(),
      isPremium: z.boolean().optional(),
    })
    .refine(
      (data) => {
        return (
          data.category !== undefined ||
          data.description !== undefined ||
          data.isPremium !== undefined
        );
      },
      {
        message:
          'At least one of category, description, or isPremium must be provided.',
      },
    ),
});

const voatingValidationSchema = z.object({
  body: z.object({
    postId: z.string({ required_error: 'Post ID must required' }),
    value: z
      .number({ required_error: 'Value must required' })
      .refine((val) => val === 1 || val === -1, {
        message: 'Value must be either 1 or -1',
      }),
  }),
});

export const PostValidation = {
  createPostValidationSchema,
  updatePostValidationSchema,
  voatingValidationSchema,
};
