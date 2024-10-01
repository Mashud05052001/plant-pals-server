/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler } from 'express';
import config from '../config';
import { ZodError } from 'zod';
import AppError from '../errors/AppError';
import { TErrorSources } from '../interface/error';
import handleZodError from '../errors/handleZodError';
import handleValidationError from '../errors/handleValidationError';
import handleCastError from '../errors/handleCastError';
import handleDuplicateError from '../errors/handleDuplicateError';
import {
  deleteMultipleImagesFromCloudinary,
  deleteSingleImageFromCloudinary,
} from '../utils/deleteImage';
import { TImageFile, TImageFiles } from '../interface/image.interface';
import handleMulterError from '../errors/handleMulterError';

const globalErrorHandler: ErrorRequestHandler = async (err, req, res, next) => {
  let statusCode = 500,
    message = `Something went wrong!`,
    errorSources: TErrorSources = [
      {
        path: '',
        message: `Something went wrong!`,
      },
    ];

  // If any image validation error occurs then only the req.file & req.files will be present otherwise it will not present
  // This deleteFromCloudinary only works if use multer-storage-cloudinary to upload on cloudinary
  if (req.files && Object.keys(req.files).length > 0) {
    await deleteMultipleImagesFromCloudinary(req.files as TImageFiles);
  }
  if (req.file && Object.keys(req.file).length > 0) {
    await deleteSingleImageFromCloudinary(req.file as TImageFile);
  }

  const getModifiedError = () => {
    if (err instanceof ZodError) return handleZodError(err);
    else if (err?.name === 'ValidationError') return handleValidationError(err);
    else if (err?.name === 'CastError') return handleCastError(err);
    else if (err.code === 11000) return handleDuplicateError(err);
    else if (err.name === 'MulterError') return handleMulterError(err);
    return null;
  };
  const modifiedError = getModifiedError();

  if (modifiedError) {
    statusCode = modifiedError.statusCode;
    message = modifiedError.message;
    errorSources = modifiedError.errorSources;
  } else if (err instanceof AppError) {
    statusCode = err?.statusCode;
    message = err?.message;
    errorSources = [{ path: '', message: err?.message }];
  } else if (err instanceof Error) {
    message = err?.message;
    errorSources = [{ path: '', message: err?.message }];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    originalError: err, // By seeing here error we can handle the error with specific code & get the message. We cannot get proper error using console.log(err)
    stack: config.node_env === 'development' ? err?.stack : null,
  });
};

export default globalErrorHandler;
