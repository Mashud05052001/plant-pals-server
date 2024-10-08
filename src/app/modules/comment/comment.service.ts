import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Post } from '../post/post.model';
import { TUserResponse } from '../user/user.interface';
import { TCreateComment, TEditComment } from './comment.interface';
import { Comments } from './comment.model';
import mongoose from 'mongoose';

const createComment = async (
  userInfo: TUserResponse,
  payload: TCreateComment,
) => {
  const postExist = await Post.findById(payload.post);
  if (!postExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'This post is not found');
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await Comments.create(
      [{ ...payload, user: userInfo?._id }],
      { session, new: true },
    );

    await Post.findByIdAndUpdate(
      payload?.post,
      { $push: { comments: result[0]._id } },
      { session, new: true },
    );
    const result2 = await Comments.findById(result[0]._id)
      .populate({
        path: 'user',
        select: 'name email _id profilePicture isVerified',
      })
      .session(session);
    await session.commitTransaction();
    await session.endSession();
    return result2;
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.CONFLICT, 'Failed to create comments');
  }
};

const getAllCommetsOfAPost = async (postId: string) => {
  const result = await Comments.find({ post: postId })
    .sort('-createdAt')
    .populate({
      path: 'user',
      select: 'name email _id profilePicture isVerified',
    })
    .select('-__v');
  return result;
};

const updateComment = async (
  userInfo: TUserResponse,
  commentId: string,
  payload: TEditComment,
) => {
  const comment = await Comments.findById(commentId);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  if (comment.user.toString() !== userInfo?._id.toString()) {
    throw new AppError(httpStatus.FORBIDDEN, 'You cannot edit others comment');
  }

  const updatedComment = await Comments.findByIdAndUpdate(commentId, payload, {
    new: true,
  });

  return updatedComment;
};

const deleteComment = async (userInfo: TUserResponse, commentId: string) => {
  const comment = await Comments.findById(commentId);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  if (comment.user.toString() !== userInfo?._id.toString()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You cannot delete others comment',
    );
  }

  await Comments.findByIdAndDelete(commentId);

  return { message: 'Comment deleted successfully' };
};

export const CommentsService = {
  createComment,
  getAllCommetsOfAPost,
  updateComment,
  deleteComment,
};
