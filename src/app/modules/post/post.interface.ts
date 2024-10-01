import { Types } from 'mongoose';

export type TVoatingUsers = {
  user: Types.ObjectId;
  value: 1 | -1;
};

export type TCreatePost = Pick<TPost, 'category' | 'description'>;

export type TPost = {
  user: Types.ObjectId;
  category: Types.ObjectId;
  description?: string;
  images: string[];
  upvote: number;
  downvote: number;
  voatingUsers: TVoatingUsers[];
  comments: Types.ObjectId[];
  isPremium: boolean;
  isVerified: boolean;
};

export type TVoatingPayload = {
  postId: string;
  value: 1 | -1;
};

export type TUpdatePost = Pick<TPost, 'category' | 'description' | 'isPremium'>;
