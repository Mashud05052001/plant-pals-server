/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { TImageFiles } from '../../interface/image.interface';
import { TUserResponse } from '../user/user.interface';
import { User } from '../user/user.model';
import { TCreatePost, TUpdatePost, TVoatingPayload } from './post.interface';
import { Post } from './post.model';

/*
requirements : 
1. Post create with multiple images
2. Post added in 2 side. posts collection & the postId must store in user myPosts array
*/
const createPost = async (
  dbUser: TUserResponse,
  payload: TCreatePost,
  imagesContainer: TImageFiles,
) => {
  const modifiedData: Record<string, unknown> = { ...payload };
  if (imagesContainer) {
    const { images } = imagesContainer;
    modifiedData.images = images.map((image) => image.path);
  }
  modifiedData.user = dbUser?._id.toString();

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const uploadPost = await Post.create([modifiedData], {
      session,
      new: true,
    });
    const postId = uploadPost[0]._id;

    await User.findByIdAndUpdate(
      dbUser?._id,
      {
        $addToSet: { myPosts: postId },
      },
      {
        session,
        new: true,
      },
    );

    await session.commitTransaction();
    await session.endSession();
    return uploadPost;
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.CONFLICT, 'Failed to upload the post');
  }
};
/*
Requirements: 
  
*/
const getAllPosts = async (query: Record<string, unknown>) => {
  const postQuery = new QueryBuilder(
    Post.find()
      .populate({
        path: 'category',
        select: '-__v',
      })
      .populate({
        path: 'user',
        select: 'name email _id role',
      }),
    query,
  )
    .search(['description', 'category'], 'upvote')
    .fields()
    .filter('upvote')
    .sort()
    .paginate();

  const result = await postQuery.modelQuery;
  const meta = await postQuery.countTotal();

  return {
    data: result,
    meta,
  };
};

const getSinglePost = async (id: string) => {
  const result = await Post.findById(id);
  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'This post is not found or deleted',
    );
  }
  return result;
};

const updatePost = async (
  dbUser: TUserResponse,
  id: string,
  payload: TUpdatePost,
) => {
  const post = await Post.findById(id);
  if (!post) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'This post is not found or deleted',
    );
  }
  if (post?.user.toString() !== dbUser?._id.toString()) {
    throw new AppError(httpStatus.FORBIDDEN, "You cann't change others post");
  }
  const result = await Post.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

const deletePost = async (dbUser: TUserResponse, id: string) => {
  const post = await Post.findById(id);
  if (!post) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'This post is not found or deleted',
    );
  }
  if (post?.user.toString() !== dbUser?._id.toString()) {
    throw new AppError(httpStatus.FORBIDDEN, "You cann't delete others post");
  }
  const result = await Post.findByIdAndDelete(id, { new: true });
  return result;
};

/*
1. Check post existency
2. User cannot vote itself
3. If User not vote this post add vote
4. If already vote & again same vote than remove the vote
5. If already vote & change the vote to another then reverse the vote(upV to downV or downV to upV )
*/
const manageVoating = async (
  dbUser: TUserResponse,
  payload: TVoatingPayload,
) => {
  const { postId, value } = payload;
  const post = await Post.findById(postId);
  const requestUserId = dbUser?._id.toString();
  const updatedData: Record<string, unknown> = {};
  // const updatedData: Partial<TPost> = {};
  if (!post) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'The post may deleted. Please reload website',
    );
  }
  if (requestUserId === post?.user.toString()) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You cannot upvote your post');
  }

  const isUserAlreadyVoteBefore = post.voatingUsers?.find(
    (item) => item.user.toString() === requestUserId,
  );

  const voteOn = value === 1 ? 'upvote' : 'downvote';
  const voteOnReverse = value === 1 ? 'downvote' : 'upvote';
  if (!isUserAlreadyVoteBefore) {
    console.log('New Voating');
    updatedData[voteOn] = post[voteOn] + 1;
    updatedData.voatingUsers = [
      ...post.voatingUsers,
      { user: dbUser?._id, value },
    ];
  } else if (isUserAlreadyVoteBefore?.value === value) {
    console.log('Same value');
    updatedData[voteOn] = post[voteOn] - 1;
    updatedData.voatingUsers = post.voatingUsers.filter(
      (item) => item.user.toString() !== requestUserId,
    );
  } else {
    console.log('Reversing Vote');
    updatedData[voteOn] = post[voteOn] + 1;
    updatedData[voteOnReverse] = post[voteOnReverse] - 1;
    updatedData.voatingUsers = post.voatingUsers.map((item) =>
      item.user.toString() === requestUserId
        ? { user: item.user, value }
        : item,
    );
  }
  const result = await Post.findByIdAndUpdate(postId, updatedData, {
    new: true,
  });
  return result;
};

export const PostService = {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
  manageVoating,
};
