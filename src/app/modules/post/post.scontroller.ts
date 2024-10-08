import httpStatus from 'http-status';
import { TImageFiles } from '../../interface/image.interface';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PostService } from './post.service';

const createPost = catchAsync(async (req, res) => {
  const result = await PostService.createPost(
    req.dbUser,
    req.body,
    req.files as TImageFiles,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post created successfully',
    data: result,
  });
});

const getAllPosts = catchAsync(async (req, res) => {
  const result = await PostService.getAllPosts(req?.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All Posts are retrieved successfully',
    data: result,
  });
});

const getSinglePost = catchAsync(async (req, res) => {
  const result = await PostService.getSinglePost(req.params?.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post is retrieved successfully',
    data: result,
  });
});

const updatePost = catchAsync(async (req, res) => {
  const result = await PostService.updatePost(
    req?.dbUser,
    req?.params?.id,
    req?.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post updated successfully',
    data: result,
  });
});

const deletePost = catchAsync(async (req, res) => {
  const result = await PostService.deletePost(req?.dbUser, req?.params?.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post deleted successfully',
    data: result,
  });
});
const manageVoating = catchAsync(async (req, res) => {
  const result = await PostService.manageVoating(req?.dbUser, req?.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Voating done',
    data: result,
  });
});

const handleFavouritePosts = catchAsync(async (req, res) => {
  const message = await PostService.handleFavouritePost(
    req?.dbUser,
    req?.params.id,
    req?.body.value,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: message,
    data: message,
  });
});

export const PostController = {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
  manageVoating,
  handleFavouritePosts,
};
