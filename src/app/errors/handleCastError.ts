import mongoose from 'mongoose';
import { TErrorSources ,TErrorResponse } from '../interface/error';

const handleCastError = (error: mongoose.Error.CastError) : TErrorResponse  => {
  const statusCode = 400;
  const message = 'Invalid ID';
  const errorSources: TErrorSources  = [
    { path: error.path, message: error.message },
  ];
  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handleCastError;
