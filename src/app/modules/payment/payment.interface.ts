import { Types } from 'mongoose';

export type TInitiatePayment = {
  //   customerName: string;
  //   customerEmail: string;
  //   user: string;
  customerPhone: string;
  cancleUrl: string;
  totalAmount: number;
};

export type TPayment = {
  userPhone: string;
  user: Types.ObjectId;
  amount: number;
  isPaid: boolean;
};
