import { model, Schema } from 'mongoose';
import { TUser, TUserMethods } from './user.interface';
import { userRolesArray } from './user.constant';
import { bcryptHelper } from '../../utils/bcryptPassword';

const userSchema = new Schema<TUser, TUserMethods>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: 0,
    },
    bio: {
      type: String,
    },
    role: {
      type: String,
      enum: userRolesArray,
      default: 'USER',
    },
    profilePicture: {
      type: String,
      default: '',
    },
    myPosts: {
      type: [Schema.Types.ObjectId],
      ref: 'Post',
      default: [],
    },
    favouritePosts: {
      type: [Schema.Types.ObjectId],
      ref: 'Post',
      default: [],
    },
    following: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    followers: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedValidity: {
      type: Date,
    },
    changePasswordAt: {
      type: Date,
    },
    resetPasswordCode: {
      type: String,
      select: 0,
    },
    resetPasswordAt: {
      type: Date,
      select: 0,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  const hashedPassword = await bcryptHelper.createHashedPassword(this.password);
  this.password = hashedPassword;
  next();
});
userSchema.set('toJSON', {
  transform: function (doc, res) {
    delete res.password;
    return res;
  },
});

userSchema.statics.findUser = async function (
  email: string,
  isPasswordRequired: boolean,
) {
  if (isPasswordRequired)
    return await User.findOne({ email }).select('+password');
  return await User.findOne({ email });
};

userSchema.statics.isPasswordValid = async function (
  plainTextPassword: string,
  hashedPassword: string,
) {
  return await bcryptHelper.compareHashedPasswordWithPlainText(
    plainTextPassword,
    hashedPassword,
  );
};

userSchema.statics.isJwtIssueBeforePasswordChange = function (
  jwtIssuedTime: number,
  passwordChangedDate: Date,
) {
  const passwordChangedTime = passwordChangedDate.getTime() / 1000;
  return jwtIssuedTime < passwordChangedTime;
};

export const User = model<TUser, TUserMethods>('User', userSchema);
