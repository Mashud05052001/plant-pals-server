/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import { TUser, TUserResponse } from './user.interface';
import { User } from './user.model';

// 2nd user er followers e 1st user er id , 1st user er following e 2nd user er id
// If alreadde folloing then simpley unfollow them

const manageFollow = async (firstUser: TUserResponse, secondUserId: string) => {
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
      return 'Unfollowed successfully';
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
      return 'Followed successfully';
    }
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(
      httpStatus.CONFLICT,
      'Following request failed. Please try again after sometimes',
    );
  }
};

export const UserService = {
  manageFollow,
};
