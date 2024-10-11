import httpStatus from 'http-status';
import { TInitiatePayment, TPayment } from './payment.interface';
import { initiatePayment, verifyPayment } from './payment.utils';
import mongoose, { Types } from 'mongoose';
import path from 'path';
import fs from 'fs';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { Payment } from './payment.model';
import { User } from '../user/user.model';

const convertObjectId = (str: string) => new Types.ObjectId(str);

const createPayment = catchAsync(async (req, res) => {
  const payload = req?.body as TInitiatePayment;
  const dbUser = req?.dbUser;
  console.log(dbUser);
  const paymentData: TPayment = {
    user: convertObjectId(dbUser?._id.toString()),
    amount: Number(payload?.totalAmount),
    userPhone: payload?.customerPhone,
    isPaid: false,
  };

  const paymentInfo = await Payment.create(paymentData);

  const result = await initiatePayment(
    req?.body,
    dbUser,
    paymentInfo?._id.toString(),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Initiate payment successfully',
    data: result,
  });
});

const confirmationPayment = catchAsync(async (req, res) => {
  const paymentId = req?.query?.paymentId as string;
  const transactionId = req?.query?.transactionId as string;

  const paymentVerification = await verifyPayment(transactionId);
  let message = '',
    description = '',
    className = '',
    icon = '';
  console.log(__dirname);
  const confirmationHtmlFilePath = path.join(
    __dirname,
    '../../../../public/payment.html',
  );
  let templete = fs.readFileSync(confirmationHtmlFilePath, 'utf-8');

  if (paymentVerification.pay_status === 'Successful') {
    const userId = req?.query?.userId as string;

    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      await Payment.findByIdAndUpdate(
        paymentId,
        { isPaid: true, transactionId: transactionId },
        { new: true },
      ).session(session);
      await User.findByIdAndUpdate(
        userId,
        {
          isVerified: true,
          verifiedValidity: new Date(
            new Date().setMonth(new Date().getMonth() + 1),
          ),
        },
        { new: true },
      ).session(session);

      await session.commitTransaction();
      await session.endSession();
      message = 'Successfully Paid';
      className = 'successfull';
      description = `Thank you for your payment.<br>Your transaction has been completed successfully.<br>TransactionId: ${transactionId}`;
      icon = '&#10003;';
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      await Payment.findByIdAndDelete(paymentId);
      message = 'Failed';
      className = 'failed';
      description =
        'Unfortunately, your payment could not be processed. Please try again or contact support.';
      icon = '&#10060;';
    }
  } else {
    await Payment.findByIdAndDelete(paymentId);
    message = 'Failed';
    className = 'failed';
    description =
      'Unfortunately, your payment could not be processed. Please try again or contact support.';
    icon = '&#10060;';
  }
  templete = templete
    .replace('{{status}}', message)
    .replace('{{dynamicClass}}', className)
    .replace('{{description}}', description)
    .replace('{{icon}}', icon);

  res.send(templete);
});

const paymentCancelled = catchAsync(async (req, res) => {
  const paymentId = req?.query?.paymentId as string;
  const returnUrl = req?.query?.returnUrl as string;
  await Payment.deleteOne({ _id: paymentId });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment cancelled successfully',
    data: returnUrl,
  });
});

const getAllPayments = catchAsync(async (req, res) => {
  const result = await Payment.find({ isPaid: true })
    .sort('-createdAt')
    .populate('user');
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All payments retrived successfull',
    data: result,
  });
});

export const PaymentService = {
  createPayment,
  confirmationPayment,
  paymentCancelled,
  getAllPayments,
};
