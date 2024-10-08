import { Model, ObjectId, Types } from 'mongoose';

export type TUserRoles = 'USER' | 'ADMIN';

export type TChangePassword = {
  oldPassword: string;
  newPassword: string;
};

export type TSendContactEmail = {
  userName: string;
  userEmail: string;
  message: string;
  sendToEmail: string;
};

export type TRegisterUser = Pick<TUser, 'name' | 'email' | 'password'>;
export type TLoginUser = Pick<TUser, 'email' | 'password'>;
export type TForgetPassword = Pick<TUser, 'email'>;
export type TCheckResetCode = { code: string } & Pick<TUser, 'email'>;

export type TResetPassword = { code: string } & Pick<
  TUser,
  'email' | 'password'
>;

export type TUserResponse = {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
} & TUser;

export type TUser = {
  name: string;
  email: string;
  password: string;
  bio?: string;
  role: TUserRoles;
  profilePicture?: string;
  myPosts?: Types.ObjectId[];
  favouritePosts?: Types.ObjectId[];
  following?: Types.ObjectId[];
  followers?: Types.ObjectId[];
  isVerified?: boolean;
  verifiedValidity?: Date;
  changePasswordAt?: Date;
  resetPasswordCode?: string;
  resetPasswordAt?: Date;
};

export type TUpdateUserData = {
  name?: string;
  bio?: string;
};

export interface TUserMethods extends Model<TUser> {
  findUser(email: string, isPasswordRequired: boolean): Promise<TUserResponse>;
  isPasswordValid(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
  isJwtIssueBeforePasswordChange(
    jwtIssuedTime: number,
    passwordChangedDate: Date,
  ): boolean;
}
