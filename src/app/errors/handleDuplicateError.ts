import { TErrorSources , TErrorResponse } from '../interface/error';

const handleDuplicateError = (error: { message: string }) : TErrorResponse => {
  const message = 'Duplicate Entry',
    statusCode = 400;
  const extracted_msg = error?.message.match(/dup key: { name: "(.*?)" }/);
  const extractedMessage = extracted_msg ? extracted_msg[1] : null;

  const errorSources: TErrorSources  = [
    {
      path: '',
      message: `${extractedMessage} is already exist`,
    },
  ];

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handleDuplicateError;
