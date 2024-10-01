import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import AppError from '../errors/AppError';
import { jwtHelper } from '../utils/jwtToken';
import catchAsync from '../utils/catchAsync';
import { TUserRoles } from '../modules/user/user.interface';

/* AUTH Middleware
1. Check token existancy
2. Verify the token
3. Extract decoded data from the token. 
4. Check provided rules is matched or not with the decoded data role
5. From decoded data check user is exist or not
6. Check user blocked / delete status
7. Check if the token is before updatedPassword or not
*/

const auth = (...requiredRoles: TUserRoles[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = (req?.headers?.authorization as string)?.split(' ')[1];

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Token is missing!');
    }
    // Ctrl+mouse click to go JwtPayload type & add role,email & others in the type to easily access
    const decoded = jwtHelper.verifyAccessToken(token) as JwtPayload;
    if (requiredRoles && !requiredRoles.includes(decoded?.role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
    }
    // DO user related work here
    req.user = decoded as JwtPayload;
    next();
  });
};

export default auth;
