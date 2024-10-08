import { model, Schema } from 'mongoose';
import { TPost, TVoatingUsers } from './post.interface';

const voatingUsersSchema = new Schema<TVoatingUsers>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    value: {
      type: Number,
      enum: [1, -1],
      required: true,
    },
  },
  {
    _id: false,
  },
);

const postSchema = new Schema<TPost>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    upvote: {
      type: Number,
      default: 0,
    },
    downvote: {
      type: Number,
      default: 0,
    },
    voatingUsers: {
      type: [voatingUsersSchema],
      default: [],
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        default: [],
      },
    ],
    isPremium: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Post = model<TPost>('Post', postSchema);
