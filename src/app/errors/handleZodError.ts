import { ZodError, ZodIssue } from 'zod';
import { TErrorSources, TErrorResponse } from '../interface/error';
import httpStatus from 'http-status';

const handleZodError = (error: ZodError): TErrorResponse => {
  const statusCode = httpStatus.BAD_REQUEST;
  const message = 'Validation Error';
  const errorSources: TErrorSources = error.issues.map((issue: ZodIssue) => {
    return {
      path: issue?.path[issue.path.length - 1].toString(),
      message: issue?.message.toString(),
    };
  });

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handleZodError;
