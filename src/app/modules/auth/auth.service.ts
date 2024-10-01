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
  TUser,
} from '../user/user.interface';
import { User } from '../user/user.model';
import { generatePasswordResetEmail } from './auth.constant';
import { generateSixDigitCode } from './auth.utils';

/*
Register User
  1. Check if the user already exists with the provided email.
  2. If the user exists, throw a conflict error.
  3. Create a new user with the provided details.
  4. Prepare JWT payload for access and refresh tokens.
  5. Generate access and refresh tokens.
  6. Return the generated tokens.
*/

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
  };
  const accessToken = jwtHelper.createJwtAccessToken(jwtPayload);
  const refreshToken = jwtHelper.createJwtRefreshToken(jwtPayload);

  return { accessToken, refreshToken };
};

/*
Login User
  1. Find the user by email.
  2. If the user does not exist, throw an error indicating the email is not found.
  3. Validate the provided password against the stored password.
  4. If the password is incorrect, throw an error.
  5. Prepare JWT payload for access and refresh tokens.
  6. Generate access and refresh tokens.
  7. Return the generated tokens.
*/

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
  };
  const accessToken = jwtHelper.createJwtAccessToken(jwtPayload);
  const refreshToken = jwtHelper?.createJwtRefreshToken(jwtPayload);

  return { accessToken, refreshToken };
};

/*
Change Password
***  Belowing 2 steps already done in auth middleware & from there we get the user database data
  1. Find the user by email from the JWT payload.
  2. If the user does not exist, throw an error.
  3. Validate the old password against the stored password.
  4. If the old password is incorrect, throw an error.
  5. Hash the new password.
  6. Update the user's password in the database.
  7. Return a success message indicating the password has been changed.
*/

const changePassword = async (
  jwtUser: TJwtPayload,
  user: TUser,
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

/*
Access Token
  1. Verify the provided refresh token.
  2. Find the user by email from the decoded token.
  3. If the user does not exist, throw an error.
  4. Prepare JWT payload for a new access token.
  5. Generate a new access token.
  6. Return the new access token.
*/

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
  };
  const accessToken = jwtHelper.createJwtAccessToken(jwtPayload);

  return accessToken;
};

/*
Forget Password
  1. Find the user by email.
  2. If the user does not exist, throw an error indicating the email is not registered.
  3. Generate a 6-digit reset password code.
  4. Set the reset password code and current date in the user record.
  5. Send a password reset email with the generated code.
  6. Return a success message indicating the password reset request has been sent.
*/

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

/*
Check Reset Password 6 digid Code
  1. Validate the email and check if the user exists.
  2. Ensure reset password code and timestamp are present. 
  3. Validate the provided reset password code.
  4. Check if the reset password code has expired.
     a. If expired, clear the reset password code and timestamp from the database.
     b. Throw an error indicating the code has expired.
*/
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

/*
Reset Password
  1. Validate the email and check if the user exists.
  2. Ensure reset password code and timestamp are present. 
  3. Check if the reset password code has expired.
     a. If expired, clear the reset password code and timestamp from the database.
     b. Throw an error indicating the code has expired.
  4. Validate that the new password is not the same as the old password.
  5. Hash the new password.
  6. Update the user's password and clear the reset password code and timestamp.
  7. Return a success message indicating the password has been reset.
*/

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

export const UserService = {
  registerUser,
  loginUser,
  changePassword,
  accessToken,
  forgetPassword,
  checkResetCode,
  resetPassword,
};
