import AppError from '../errors/AppError';
import catchAsync from '../utils/catchAsync';

// Used in those time when user is sending (data+picture) through using formData.
// Here data found in req.body.data & we have to parse it & set it into req.body

export const parseBody = catchAsync(async (req, _res, next) => {
  if (!req.body.data) {
    throw new AppError(400, 'Please provide data in the body under data key');
  }
  req.body = JSON.parse(req.body.data);
  next();
});
