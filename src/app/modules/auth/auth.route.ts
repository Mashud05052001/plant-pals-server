import { Router } from 'express';
import { UserController } from './auth.scontroller';
import auth from '../../middleware/auth';
import validateRequest, {
  validateRequestCookies,
} from '../../middleware/validateRequest';
import { UserValidation } from './auth.validation';

const router = Router();

router.post(
  '/register',
  validateRequest(UserValidation.registerValidationSchema),
  UserController.registerUser,
);

router.post(
  '/login',
  validateRequest(UserValidation.loginValidationSchema),
  UserController.loginUser,
);

router.post(
  '/change-password',
  validateRequest(UserValidation.changePasswordValidationSchema),
  auth(true, 'ADMIN', 'USER'),
  UserController.changePassword,
);

router.post(
  '/refresh-token',
  validateRequestCookies(UserValidation.accessTokenValidationSchema),
  UserController.accessToken,
);

router.post(
  '/forget-password',
  validateRequest(UserValidation.forgetPasswordValidationSchema),
  UserController.forgetPassword,
);

router.post(
  '/check-reset-code',
  validateRequest(UserValidation.checkResetCodeValidationSchema),
  UserController.checkResetCode,
);

router.post(
  '/reset-password',
  validateRequest(UserValidation.resetPasswordValidationSchema),
  UserController.resetPassword,
);

export const AuthRoutes = router;
