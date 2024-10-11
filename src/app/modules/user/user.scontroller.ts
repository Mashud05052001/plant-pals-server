import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserService } from './user.service';
import { TImageFile } from '../../interface/image.interface';
import moment from 'moment';

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

const getAdminDashboardData = catchAsync(async (req, res) => {
  const year = Number(req.query?.year) || moment().year();
  const result = await UserService.getAdminDashboardData(year);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard record retrived successfully',
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

const manageFollowing = catchAsync(async (req, res) => {
  const result = await UserService.manageFollowing(
    req?.dbUser,
    req?.params?.id,
  );
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
  getAllUsers,
  manageFollowing,
  updateUserRole,
  deleteUser,
  getAdminDashboardData,
};
