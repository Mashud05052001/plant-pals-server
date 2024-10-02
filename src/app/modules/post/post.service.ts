import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { TImageFiles } from '../../interface/image.interface';
import { TUserResponse } from '../user/user.interface';
import { User } from '../user/user.model';
import { TCreatePost, TUpdatePost, TVoatingPayload } from './post.interface';
import { Post } from './post.model';
import { Comments } from '../comment/comment.model';

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

const getSinglePost = async (postId: string) => {
  const result = await Post.findById(postId);
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

/*
1. Delete the post
2. Delete the comments on the corresponding post
3. Pop out the post id from the createdBy users myPosts
4. Pop out the post if from the favouritePosts of every users which has favourite it
*/
const deletePost = async (dbUser: TUserResponse, postId: string) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'This post is not found or deleted',
    );
  }
  if (
    dbUser.role === 'USER' &&
    post?.user.toString() !== dbUser?._id.toString()
  ) {
    throw new AppError(httpStatus.FORBIDDEN, "You cann't delete others post");
  }
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    await Post.findByIdAndDelete(postId, { session, new: true });
    await User.findByIdAndUpdate(
      post?.user,
      {
        $pull: { myPosts: post?._id },
      },
      { session, new: true },
    );
    await User.updateMany(
      {
        favouritePosts: post?._id,
      },
      {
        $pop: { favouritePosts: post?._id },
      },
      { session, new: true },
    );
    await Comments.deleteMany({ post: post?._id }, { session, new: true });
    await session.commitTransaction();
    await session.endSession();
    return 'Post deleted successfully';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.CONFLICT, 'Failed to delete the post');
  }
};

/*
1. Check post existency
2. User cannot vote itself
3. If User not vote this post add vote
4. Else user cannot revote or change vote
*/
const manageVoating = async (
  dbUser: TUserResponse,
  payload: TVoatingPayload,
) => {
  const { postId, value } = payload;
  const post = await Post.findById(postId);
  const requestUserId = dbUser?._id.toString();

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

  if (isUserAlreadyVoteBefore) {
    const previousVoteOn =
      isUserAlreadyVoteBefore.value === 1 ? 'Upvote' : 'Downvote';
    throw new Error(
      `You have already ${previousVoteOn} this post. You cann't modify it.`,
    );
  }

  const result = await Post.findByIdAndUpdate(
    postId,
    {
      $set: { [value === 1 ? 'upvote' : 'downvote']: value },
      $push: { voatingUsers: { user: dbUser?._id, value } },
    },
    { new: true },
  );
  return result;
};

/*
1. Previously selected hole remove from favourite posts
2. Na hole add to favourite posts
*/
const favouritePost = async (dbUser: TUserResponse, postId: string) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'This post is not found or deleted',
    );
  }
  const isAlreadyFavourite = dbUser?.favouritePosts?.find(
    (postObjId) => postObjId.toString() === postId,
  );
  if (isAlreadyFavourite) {
    console.log('Removed');
    const result = await User.findByIdAndUpdate(
      dbUser?._id,
      {
        $pull: { favouritePosts: postId },
      },
      { new: true },
    );
    return { result, message: 'Removed form favourites successfully' };
  } else {
    console.log('Added');
    const result = await User.findByIdAndUpdate(
      dbUser?._id,
      {
        $push: { favouritePosts: postId },
      },
      { new: true },
    );
    return { result, message: 'Add to favourites successfully' };
  }
};

export const PostService = {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
  manageVoating,
  favouritePost,
};
