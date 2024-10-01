import { JwtPayload } from 'jsonwebtoken';
import { TUserResponse } from '../modules/user/user.interface';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
      dbUser: TUserResponse;
    }
  }
}
