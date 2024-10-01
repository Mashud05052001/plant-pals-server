import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { TErrorSources, TErrorResponse  } from '../interface/error';

const handleValidationError = (error: mongoose.Error.ValidationError) : TErrorResponse => {
  const statusCode = httpStatus.BAD_REQUEST;
  const message = 'Validation Error';
  const errorSources : TErrorSources  = Object.values(error.errors).map(
    (error) => {
      return {
        message: error.message,
        path: error.path,
      };
    },
  );
  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handleValidationError;
