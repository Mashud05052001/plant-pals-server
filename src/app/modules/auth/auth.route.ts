import { Router } from 'express';
import { AuthController } from './auth.scontroller';
import auth from '../../middleware/auth';
import validateRequest, {
  validateRequestCookies,
} from '../../middleware/validateRequest';
import { AuthValidation } from './auth.validation';

const router = Router();

/*
Auth
1. Registration           '/register'
2. Login                  '/login'
3. Change Password        '/change-password'
4. Refresh Token          '/refresh-token'
5. Forget Password        '/forget-password'
6. Validate Reset Code    '/check-reset-code'
7. Reset Password         '/reset-password'
*/

router.post(
  '/register',
  validateRequest(AuthValidation.registerValidationSchema),
  AuthController.registerUser,
);

router.post(
  '/login',
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.loginUser,
);

router.post(
  '/change-password',
  validateRequest(AuthValidation.changePasswordValidationSchema),
  auth(true, 'ADMIN', 'USER'),
  AuthController.changePassword,
);

router.post(
  '/refresh-token',
  validateRequestCookies(AuthValidation.accessTokenValidationSchema),
  AuthController.accessToken,
);

router.post(
  '/forget-password',
  validateRequest(AuthValidation.forgetPasswordValidationSchema),
  AuthController.forgetPassword,
);

router.post(
  '/check-reset-code',
  validateRequest(AuthValidation.checkResetCodeValidationSchema),
  AuthController.checkResetCode,
);

router.post(
  '/reset-password',
  validateRequest(AuthValidation.resetPasswordValidationSchema),
  AuthController.resetPassword,
);

router.post(
  '/send-contact-email',
  validateRequest(AuthValidation.sendEmailValidationSchem),
  AuthController.sendContactEmail,
);

export const AuthRoutes = router;
