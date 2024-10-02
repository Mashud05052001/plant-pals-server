import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserService } from './user.service';
import { TImageFile } from '../../interface/image.interface';

// ADMIN Only
const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserService.getAllUsers(req?.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All users retrived successfully',
    data: result,
  });
});
const updateUserRole = catchAsync(async (req, res) => {
  const result = await UserService.updateUserRole(req.user, req?.params?.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Role changed successfully',
    data: result,
  });
});

// Any Person can access
const getSingleUser = catchAsync(async (req, res) => {
  const result = await UserService.getSingleUser(req?.params?.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrived successfully',
    data: result,
  });
});

// Authorized Person
const getMe = catchAsync(async (req, res) => {
  const result = await UserService.getMe(req?.dbUser, req?.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrived successfully',
    data: result,
  });
});

const updateMe = catchAsync(async (req, res) => {
  const result = await UserService.updateMe(req.dbUser, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});

const updateProfilePicture = catchAsync(async (req, res) => {
  const result = await UserService.updateProfilePicture(
    req.dbUser,
    req.file as TImageFile,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile picture updated successfully',
    data: result,
  });
});

const updateCoverPicture = catchAsync(async (req, res) => {
  const result = await UserService.updateCoverPicture(
    req.dbUser,
    req.file as TImageFile,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User cover picture updated successfully',
    data: result,
  });
});

const manageFollow = catchAsync(async (req, res) => {
  const result = await UserService.manageFollow(req?.dbUser, req?.params?.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Following done',
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const result = await UserService.deleteUser(req?.dbUser, req?.params?.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

export const UserController = {
  getSingleUser,
  getMe,
  updateMe,
  updateProfilePicture,
  updateCoverPicture,
  getAllUsers,
  manageFollow,
  updateUserRole,
  deleteUser,
};
