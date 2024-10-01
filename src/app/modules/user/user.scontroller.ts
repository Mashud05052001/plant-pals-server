import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserService } from './user.service';

const manageFollow = catchAsync(async (req, res) => {
  const result = await UserService.manageFollow(req?.dbUser, req?.params?.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Following done',
    data: result,
  });
});

export const UserController = {
  manageFollow,
};
