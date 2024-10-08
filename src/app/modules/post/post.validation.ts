import { z } from 'zod';

const createPostValidationSchema = z.object({
  body: z.object({
    category: z.string({ required_error: 'Post category is required' }),
    title: z.string({ invalid_type_error: 'Title must be in string' }).min(4, {
      message: 'Title must be at least 4 characters long',
    }),
    description: z
      .string({ required_error: 'Description is required' })
      .min(4, {
        message: 'Description must be at least 4 characters long',
      }),
    isPremium: z.boolean().optional(),
  }),
});

const updatePostValidationSchema = z.object({
  body: z
    .object({
      title: z
        .string({ invalid_type_error: 'Title must be in string' })
        .min(4, {
          message: 'Title must be at least 4 characters long',
        })
        .optional(),
      description: z
        .string({ invalid_type_error: 'Description must be in string' })
        .min(4, {
          message: 'Description must be at least 4 characters long',
        })
        .optional(),
      category: z
        .string({ required_error: 'Post category is required' })
        .optional(),
      isPremium: z.boolean().optional(),
    })
    .refine(
      (data) => {
        return (
          data.title !== undefined ||
          data.category !== undefined ||
          data.description !== undefined ||
          data.isPremium !== undefined
        );
      },
      {
        message:
          'At least one of title, category, description, or isPremium must be provided.',
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

const favouritePostValidationSchema = z.object({
  body: z.object({
    value: z.enum(['add', 'remove'], {
      required_error:
        "The 'value' field must contain either 'add' or 'remove'.",
      invalid_type_error:
        "Invalid type provided for 'value'. It must be either 'add' or 'remove'.",
    }),
  }),
});

export const PostValidation = {
  createPostValidationSchema,
  updatePostValidationSchema,
  voatingValidationSchema,
  favouritePostValidationSchema,
};
