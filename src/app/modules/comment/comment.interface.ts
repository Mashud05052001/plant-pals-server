import { Types } from 'mongoose';

export type TCreateComment = Omit<TComment, 'user'>;
export type TEditComment = Pick<TComment, 'message'>;

export type TComment = {
  user: Types.ObjectId;
  post: Types.ObjectId;
  message: string;
};
