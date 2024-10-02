import { z } from 'zod';

const updateUserInfoValidationSchema = z.object({
  body: z
    .object({
      name: z
        .string({
          invalid_type_error: 'Name must be a string',
        })
        .optional(),
      bio: z
        .string({
          invalid_type_error: 'Bio must be a string',
        })
        .optional(),
    })
    .refine((objData) => Object.keys(objData).length > 0, {
      message: 'Please provide at least one valid field for update',
    }),
});

export const UserValidation = {
  updateUserInfoValidationSchema,
};
