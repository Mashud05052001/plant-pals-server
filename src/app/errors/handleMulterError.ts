import { TErrorSources, TErrorResponse } from '../interface/error';

type TMulterError = {
  name: string;
  message: string;
  //   code: 'LIMIT_UNEXPECTED_FILE';
  code: string;
  field: string;
};

const handleMulterError = (error: TMulterError): TErrorResponse => {
  let message = 'Multer Error';
  const statusCode = 400;
  const errorSources: TErrorSources = [
    {
      path: '',
      message: ``,
    },
  ];
  if (error?.code === 'LIMIT_UNEXPECTED_FILE') {
    message = 'Multer image quantity error';
    errorSources[0].path = 'images';
    errorSources[0].message = 'You cannot upload more than 4 images';
  }

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handleMulterError;
