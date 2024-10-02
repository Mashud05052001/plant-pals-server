import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { TUserResponse } from './user.interface';
import { User } from './user.model';
import config from '../../config';
import { TJwtPayload } from '../../utils/jwtToken';
import { Comments } from '../comment/comment.model';
import { Post } from '../post/post.model';

// UPDATE MYSELF
// DELETE MYSELF
// GET SINGLE USER

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

/*
1. Delete the user
2. Delete all the posts of the user
3. Delete all the comments of the user
4. Remove the deleted userId from the others users followers section
4. Remove the deleted userId from the others users following section
*/
const deleteUser = async (userId: string) => {
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
  manageFollow,
  updateUserRole,
  deleteUser,
};
