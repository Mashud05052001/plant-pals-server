import httpStatus from 'http-status';

import catchAsync from '../../utils/catchAsync';
import { UserService } from './auth.service';
import sendResponse from '../../utils/sendResponse';

const registerUser = catchAsync(async (req, res) => {
  const data = req.body;

  const result = await UserService.registerUser(data);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User registered successfully',
    data: result,
  });
});

const loginUser = catchAsync(async (req, res) => {
  const data = req.body;
  const result = await UserService.loginUser(data);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged in successfully',
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const result = await UserService.changePassword(req.user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password changed successfully',
    data: result,
  });
});

const accessToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await UserService.accessToken(refreshToken);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token retrieved successfully',
    data: result,
  });
});

const forgetPassword = catchAsync(async (req, res) => {
  const result = await UserService.forgetPassword(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reset email sent successfully. Please check your email!',
    data: result,
  });
});

const checkResetCode = catchAsync(async (req, res) => {
  const result = await UserService.checkResetCode(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset code is valid',
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const result = await UserService.resetPassword(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message:
      'Password changed successfully. Please login with the new password.',
    data: result,
  });
});

export const UserController = {
  registerUser,
  loginUser,
  changePassword,
  accessToken,
  forgetPassword,
  checkResetCode,
  resetPassword,
};
