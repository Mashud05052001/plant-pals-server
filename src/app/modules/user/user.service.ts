import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import config from '../../config';
import AppError from '../../errors/AppError';
import { TImageFile } from '../../interface/image.interface';
import { TJwtPayload } from '../../utils/jwtToken';
import { Comments } from '../comment/comment.model';
import { Post } from '../post/post.model';
import { TUpdateUserData, TUserResponse } from './user.interface';
import { User } from './user.model';
import moment from 'moment';
import { Payment } from '../payment/payment.model';

// ADMIN Only
const getAllUsers = async (query: Record<string, unknown>) => {
  const usersQuery = new QueryBuilder(
    User.find().select('name email role profilePicture isVerified'),
    query,
  )
    .paginate()
    .search(['name email'], '-createdAt')
    .filter('-createdAt')
    .sort();

  const result = await usersQuery.modelQuery;
  const meta = await usersQuery.countTotal();
  return {
    data: result,
    meta,
  };
};
const updateUserRole = async (decodedUser: TJwtPayload, userId: string) => {
  const userExist = await User.findById(userId);
  if (!userExist) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'The user is deleted or not found',
    );
  }
  if (userExist.email === config.admin_email) {
    throw new AppError(
      httpStatus.NOT_ACCEPTABLE,
      'Connot modify the role of Super-Admin',
    );
  }
  if (decodedUser.email === userExist.email) {
    throw new AppError(
      httpStatus.NOT_ACCEPTABLE,
      'User cannot change his role',
    );
  }

  const result = await User.findByIdAndUpdate(
    userId,
    {
      $set: { role: userExist.role === 'USER' ? 'ADMIN' : 'USER' },
    },
    { new: true },
  );
  return result;
};

const getAdminDashboardData = async (year: number = moment().year()) => {
  const currentYearStart = moment().year(year).startOf('year').toDate();
  const currentYearEnd = moment().year(year).endOf('year').toDate();

  const userRegistrations = await User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: currentYearStart,
          $lte: currentYearEnd,
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.month': 1 }, // Sort by month
    },
    {
      $project: {
        _id: 0,
        month: '$_id.month',
        count: 1,
      },
    },
  ]);

  const postRegistrations = await Post.aggregate([
    {
      $match: {
        createdAt: {
          $gte: currentYearStart,
          $lte: currentYearEnd,
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.month': 1 }, // Sort by month
    },
    {
      $project: {
        _id: 0,
        month: '$_id.month',
        count: 1,
      },
    },
  ]);
  const paymentAggregations = await Payment.aggregate([
    {
      $match: {
        createdAt: {
          $gte: currentYearStart,
          $lte: currentYearEnd,
        },
        isPaid: true,
      },
    },
    {
      $group: {
        _id: { month: { $month: '$createdAt' } },
        noOfPayments: { $sum: 1 },
        totalPaymentsCollection: { $sum: '$amount' },
      },
    },
    {
      $sort: { '_id.month': 1 },
    },
    {
      $project: {
        _id: 0,
        month: '$_id.month',
        noOfPayments: 1,
        totalPaymentsCollection: 1,
      },
    },
  ]);

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dashboardData = months.map((month) => ({
    month,
    newUsers: 0,
    newPosts: 0,
    countPayments: 0,
    totalPaymentsCollection: 0,
  }));

  userRegistrations.forEach(({ month, count }) => {
    dashboardData[month - 1].newUsers = count;
  });
  postRegistrations.forEach(({ month, count }) => {
    dashboardData[month - 1].newPosts = count;
  });
  paymentAggregations.forEach(
    ({ month, noOfPayments, totalPaymentsCollection }) => {
      dashboardData[month - 1].countPayments = noOfPayments;
      dashboardData[month - 1].totalPaymentsCollection =
        totalPaymentsCollection;
    },
  );

  return dashboardData;
};

// Any user & admin can visit another user profile & show
const getSingleUser = async (userId: string) => {
  const userInfo = await User.findById(userId)
    .select('-favouritePosts')
    .populate('myPosts');
  if (!userInfo) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  return userInfo;
};

// Authorized Person
// Get all in latest first types
const getMe = async (dbUser: TUserResponse, query: Record<string, unknown>) => {
  const populateFields = [
    'myPosts',
    'favouritePosts',
    'following',
    'followers',
  ].filter((field) => (query?.populate as string)?.includes(field));

  let userQuery = User.findById(dbUser?._id);

  if (populateFields.length > 0) {
    const populationOptions = populateFields.map((field) => {
      if (field === 'myPosts') {
        return {
          path: field,
          populate: {
            path: 'category',
          },
          options: { sort: { createdAt: -1 } },
        };
      }
      return {
        path: field,
        options: { sort: { createdAt: -1 } },
      };
    });

    userQuery = userQuery.populate(populationOptions);
  }

  // Execute the query
  const userInfo = await userQuery;
  return userInfo;
};

const updateMe = async (dbUser: TUserResponse, payload: TUpdateUserData) => {
  const result = await User.findByIdAndUpdate(dbUser?._id, payload, {
    new: true,
  });
  return result;
};

const updateProfilePicture = async (
  dbUser: TUserResponse,
  imageFile: TImageFile,
) => {
  return await User.findByIdAndUpdate(
    dbUser?._id,
    { profilePicture: imageFile?.path },
    { new: true },
  );
};

/* 
  1.  2nd user er followers e 1st user er id , 1st user er following e 2nd user er id
  2.  If alreadde folloing then simpley unfollow them
*/
const manageFollowing = async (
  firstUser: TUserResponse,
  secondUserId: string,
) => {
  const firstUserId = firstUser?._id.toString();
  const secondUser = await User.findById(secondUserId);
  if (!secondUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'The following user not found');
  }
  if (firstUserId === secondUserId) {
    throw new AppError(httpStatus.CONFLICT, 'You cannot follow yourself');
  }

  const isAlreadyFollowing = secondUser.followers?.find(
    (userId) => userId.toString() === firstUserId,
  );

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    if (isAlreadyFollowing) {
      // Unfollow the user
      await User.findByIdAndUpdate(
        firstUserId,
        { $pull: { following: secondUserId } },
        { session, new: true },
      );
      await User.findByIdAndUpdate(
        secondUserId,
        { $pull: { followers: firstUserId } },
        { session, new: true },
      );
      await session.commitTransaction();
      await session.endSession();
      return {
        followed: false,
        message: 'Unfollowed successfully',
      };
    } else {
      // Follow the user
      await User.findByIdAndUpdate(
        firstUserId,
        { $addToSet: { following: secondUserId } },
        { session, new: true },
      );
      await User.findByIdAndUpdate(
        secondUserId,
        { $addToSet: { followers: firstUserId } },
        { session, new: true },
      );
      await session.commitTransaction();
      await session.endSession();
      return {
        followed: true,
        message: 'Followed successfully',
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(
      httpStatus.CONFLICT,
      'Following request failed. Please try again after sometimes',
    );
  }
};

/*
1. Admin can delete any users instead of seeding time created admin.
2. User can only delete himself
3. Delete the user
4. Delete all the posts of the user
5. Delete all the comments of the user
6. Remove the deleted userId from the others users followers section
7. Remove the deleted userId from the others users following section
*/

const deleteUser = async (dbUser: TUserResponse, userId: string) => {
  const userExist = await User.findById(userId);
  if (!userExist) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'The user is already deleted or not found',
    );
  }
  if (userExist.email === config.admin_email) {
    throw new AppError(
      httpStatus.NOT_ACCEPTABLE,
      'Cannot deleted the Super-Admin ID',
    );
  }
  if (dbUser?.role === 'USER' && dbUser?._id.toString() !== userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You cann't delete other user");
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    await User.findByIdAndDelete(userId, { session, new: true });
    await User.updateMany(
      { following: userId },
      { $pull: { following: userId } },
      { session, new: true },
    );
    await User.updateMany(
      { followers: userId },
      { $pull: { followers: userId } },
      { session, new: true },
    );
    await Comments.deleteMany({ user: userId }, { session, new: true });
    await Post.deleteMany({ user: userId }, { session, new: true });
    await session.commitTransaction();
    await session.endSession();
    return 'User deleted successfully';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.CONFLICT, 'Failed to delete the user');
  }
};

export const UserService = {
  getMe,
  getSingleUser,
  updateMe,
  updateProfilePicture,
  getAllUsers,
  manageFollowing,
  updateUserRole,
  deleteUser,
  getAdminDashboardData,
};
