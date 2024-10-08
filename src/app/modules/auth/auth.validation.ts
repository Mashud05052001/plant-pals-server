import { z } from 'zod';
import { userRolesArray } from '../user/user.constant';

const registerValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'User name is required',
      invalid_type_error: 'User name must be string',
    }),
    email: z
      .string({ required_error: 'User email is required' })
      .email({ message: 'Provide a valid email' }),
    password: z.string({
      required_error: 'User password is required',
      invalid_type_error: 'User password must be string',
    }),
    role: z
      .enum(userRolesArray as [string, ...string[]], {
        required_error: 'User role is required',
        invalid_type_error: `User role can be either 'user' or 'admin'`,
      })
      .default('USER')
      .optional(),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'User email is required' })
      .email({ message: 'Provide a valid email' }),
    password: z.string({
      required_error: 'User password is required',
      invalid_type_error: 'User password must be string',
    }),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string({
      required_error: 'Old password is required',
      invalid_type_error: 'Old password must be string',
    }),
    newPassword: z.string({
      required_error: 'New password is required',
      invalid_type_error: 'New password must be string',
    }),
  }),
});

const accessTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: 'Refresh Token is required',
    }),
  }),
});

const forgetPasswordValidationSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'User email is required' })
      .email({ message: 'Provide a valid email' }),
  }),
});

const checkResetCodeValidationSchema = z.object({
  body: z.object({
    code: z
      .string()
      .length(6, 'Reset code must be exactly 6 digits.')
      .regex(/^\d{6}$/, 'Reset code must contain only digits.'),
    email: z
      .string({ required_error: 'User email is required' })
      .email({ message: 'Provide a valid email' }),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z.object({
    code: z
      .string()
      .length(6, 'Reset code must be exactly 6 digits.')
      .regex(/^\d{6}$/, 'Reset code must contain only digits.'),
    email: z
      .string({ required_error: 'User email is required' })
      .email({ message: 'Provide a valid email' }),
    password: z.string({
      required_error: 'User password is required',
      invalid_type_error: 'User password must be string',
    }),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
  changePasswordValidationSchema,
  accessTokenValidationSchema,
  forgetPasswordValidationSchema,
  checkResetCodeValidationSchema,
  resetPasswordValidationSchema,
};
