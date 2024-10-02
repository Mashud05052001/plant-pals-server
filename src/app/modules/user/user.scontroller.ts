import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserService } from './user.service';

// ADMIN WORK
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

//
const getMyInformation = catchAsync(async (req, res) => {
  const result = await UserService.getMyInformation(req?.dbUser, req?.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrived successfully',
    data: result,
  });
});

const updateMyself = catchAsync(async (req, res) => {
  const result = await UserService.updateMyself(req.dbUser, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User updated successfully',
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
  getMyInformation,
  updateMyself,
  getAllUsers,
  manageFollow,
  updateUserRole,
  deleteUser,
};
