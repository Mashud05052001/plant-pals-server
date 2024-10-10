import httpStatus from 'http-status';
import config from '../../config';
import AppError from '../../errors/AppError';
import { bcryptHelper } from '../../utils/bcryptPassword';
import { EmailHelper } from '../../utils/emailSender';
import { jwtHelper, TJwtPayload } from '../../utils/jwtToken';
import {
  TChangePassword,
  TCheckResetCode,
  TForgetPassword,
  TLoginUser,
  TRegisterUser,
  TResetPassword,
  TUserResponse,
} from '../user/user.interface';
import { User } from '../user/user.model';
import { generatePasswordResetEmail } from './auth.constant';
import { generateSixDigitCode } from './auth.utils';

const registerUser = async (payload: TRegisterUser) => {
  const user = await User.findUser(payload.email, false);
  if (user) {
    throw new AppError(
      httpStatus.CONFLICT,
      'This email already have an account in our system. Try to login!',
    );
  }

  await User.create(payload);

  const jwtPayload: TJwtPayload = {
    name: payload?.name,
    email: payload?.email,
    role: 'USER',
    profilePicture: '',
  };

  const accessToken = jwtHelper.createJwtAccessToken(jwtPayload);
  const refreshToken = jwtHelper.createJwtRefreshToken(jwtPayload);

  return { accessToken, refreshToken };
};

const loginUser = async (payload: TLoginUser) => {
  const user = await User.findUser(payload.email, true);
  if (!user) {
    throw new AppError(
      httpStatus.CONFLICT,
      'This email is not found. Please register first!',
    );
  }

  if (
    payload?.password &&
    !(await User.isPasswordValid(payload.password, user.password))
  ) {
    throw new AppError(httpStatus.FORBIDDEN, 'Incorrect Password');
  }

  const jwtPayload: TJwtPayload = {
    name: user?.name,
    email: user?.email,
    role: user?.role,
    profilePicture: user?.profilePicture || '',
  };
  const accessToken = jwtHelper.createJwtAccessToken(jwtPayload);
  const refreshToken = jwtHelper?.createJwtRefreshToken(jwtPayload);

  return { accessToken, refreshToken };
};

const changePassword = async (
  jwtUser: TJwtPayload,
  user: TUserResponse,
  payload: TChangePassword,
) => {
  if (
    payload?.oldPassword &&
    user?.password &&
    !(await User.isPasswordValid(payload.oldPassword, user.password))
  ) {
    throw new AppError(httpStatus.FORBIDDEN, 'Incorrect old password');
  }

  if (payload?.newPassword === payload?.oldPassword) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'New password cannot be same with old one',
    );
  }

  const hashedNewPassword = await bcryptHelper.createHashedPassword(
    payload?.newPassword,
  );

  user.password = hashedNewPassword;

  await User.findOneAndUpdate(
    { email: jwtUser?.email },
    { password: hashedNewPassword },
    { new: true },
  );

  return 'Password changed successfully';
};

const accessToken = async (refreshToken: string) => {
  const decodedData = jwtHelper.verifyRefrestToken(refreshToken);

  const user = await User.findOne({ email: decodedData.email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }

  const jwtPayload: TJwtPayload = {
    name: user?.name,
    email: user?.email,
    role: user?.role,
    profilePicture: user?.profilePicture || '',
  };
  const accessToken = jwtHelper.createJwtAccessToken(jwtPayload);

  return accessToken;
};

const forgetPassword = async (payload: TForgetPassword) => {
  const user = await User.findOne({
    email: payload.email,
  });
  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'This email is not registered yet. Please signup.',
    );
  }
  const sixDigitCode = generateSixDigitCode();
  await User.findByIdAndUpdate(user?._id, {
    resetPasswordCode: sixDigitCode,
    resetPasswordAt: new Date(),
  });
  const passwordResetHtml = generatePasswordResetEmail(
    user?.name,
    sixDigitCode,
  );

  await EmailHelper.sendEmail(
    user.email,
    passwordResetHtml,
    'high',
    config.sender_email,
  );
  return 'Password reset request send successfully';
};

const checkResetCode = async (payload: TCheckResetCode) => {
  const user = await User.findOne({ email: payload.email }).select(
    '+resetPasswordCode +resetPasswordAt',
  );

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This email is not found.');
  }

  if (!user.resetPasswordCode || !user.resetPasswordAt) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Invalid request. Please try again.',
    );
  }

  if (user.resetPasswordCode !== payload.code) {
    throw new AppError(httpStatus.FORBIDDEN, 'The code is incorrect.');
  }

  const tenMinutesInMillis = 10 * 60 * 1000;
  const codeExpirationTime =
    new Date(user.resetPasswordAt).getTime() + tenMinutesInMillis;

  if (Date.now() > codeExpirationTime) {
    if (user?.resetPasswordAt || user?.resetPasswordCode) {
      user.resetPasswordCode = undefined;
      user.resetPasswordAt = undefined;
      await user.save();
    }
    throw new AppError(httpStatus.FORBIDDEN, 'The code has been expired.');
  }

  return 'Reset code is valid';
};

const resetPassword = async (payload: TResetPassword) => {
  const user = await User.findOne({ email: payload?.email }).select(
    '+password +resetPasswordCode +resetPasswordAt',
  );
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This email is not found.');
  }

  if (!user?.resetPasswordCode || !user?.resetPasswordAt) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Invalid request. Please try again',
    );
  }

  if (user.resetPasswordCode !== payload.code) {
    throw new AppError(httpStatus.FORBIDDEN, 'The code is incorrect.');
  }
  const tenMinutesInMillis = 10 * 60 * 1000;
  const codeExpirationTime =
    new Date(user.resetPasswordAt).getTime() + tenMinutesInMillis;
  if (Date.now() > codeExpirationTime) {
    if (user?.resetPasswordAt || user?.resetPasswordCode) {
      await User.findByIdAndUpdate(user?._id, {
        $unset: {
          resetPasswordCode: 1,
          resetPasswordAt: 1,
        },
      });
    }
    throw new AppError(httpStatus.FORBIDDEN, 'The code has been expired.');
  }

  if (await User.isPasswordValid(payload.password, user.password)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "That's your previous password. Please generate a new one.",
    );
  }

  const hashedNewPassword = await bcryptHelper.createHashedPassword(
    payload.password,
  );

  await User.findByIdAndUpdate(user?._id, {
    $unset: {
      resetPasswordCode: 1,
      resetPasswordAt: 1,
    },
    $set: {
      password: hashedNewPassword,
      changePasswordAt: new Date(),
    },
  });

  return 'Password reset successful. Please login to continue';
};

export const AuthService = {
  registerUser,
  loginUser,
  changePassword,
  accessToken,
  forgetPassword,
  checkResetCode,
  resetPassword,
};
