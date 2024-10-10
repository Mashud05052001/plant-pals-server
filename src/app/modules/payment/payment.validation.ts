import { z } from 'zod';

const paymentValidationSchema = z.object({
  body: z.object({
    customerPhone: z.string({
      required_error: 'Customer phone number is required',
    }),
    cancleUrl: z
      .string({ invalid_type_error: 'Cancle url is required' })
      .url('Invalid URL format'),
    totalAmount: z.number().positive('Total amount must be greater than 0'),
  }),
});

export default paymentValidationSchema;
