import { z } from 'zod';

const createCommentValidationSchema = z.object({
  body: z.object({
    post: z.string({ required_error: 'Post ID is required' }),
    message: z
      .string({ required_error: 'Message is required' })
      .min(1, { message: 'Message cannot be empty' }),
  }),
});

const updateCommentValidationSchema = z.object({
  body: z.object({
    message: z
      .string({ required_error: 'Message is required' })
      .min(1, { message: 'Message cannot be empty' }),
  }),
});

export const CommentsValidation = {
  createCommentValidationSchema,
  updateCommentValidationSchema,
};
