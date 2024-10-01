import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { CommentsService } from './comment.service';
import sendResponse from '../../utils/sendResponse';

const createComment = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentsService.createComment(req.dbUser, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Comment created successfully',
    data: result,
  });
});

const getAllCommentsOfAPost = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CommentsService.getAllCommetsOfAPost(
      req.params.postId,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Comments fetched successfully',
      data: result,
    });
  },
);

const updateComment = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentsService.updateComment(
    req.dbUser,
    req.params.commentId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment updated successfully',
    data: result,
  });
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentsService.deleteComment(
    req?.dbUser,
    req.params.commentId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment updated successfully',
    data: result,
  });
});

export const CommentsController = {
  createComment,
  updateComment,
  getAllCommentsOfAPost,
  deleteComment,
};
