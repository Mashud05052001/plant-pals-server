import { Router } from 'express';
import { multerUpload } from '../../config/multer.config';
import auth from '../../middleware/auth';
import validateImageFileRequest from '../../middleware/validateImageFileRequest';
import validateRequest from '../../middleware/validateRequest';
import { ImageFileValidationSchema } from '../../zod/image.validation';
import { UserController } from './user.scontroller';
import { UserValidation } from './user.validation';

const router = Router();

// Only ADMIN
router.get('/all', auth(false, 'ADMIN'), UserController.getAllUsers);

router.get(
  '/dashboard',
  auth(false, 'ADMIN'),
  UserController.getAdminDashboardData,
);

router.patch(
  '/change-role/:id',
  auth(false, 'ADMIN'),
  UserController.updateUserRole,
);

// router.get('/')

// Authorized Person Accessable
router.get('/me', auth(false, 'ADMIN', 'USER'), UserController.getMe);

// Any user accessable (without login also)
router.get('/:id', UserController.getSingleUser);

router.patch(
  '/update-me',
  validateRequest(UserValidation.updateUserInfoValidationSchema),
  auth(false, 'ADMIN', 'USER'),
  UserController.updateMe,
);

router.patch(
  '/update-profile-picture',
  auth(false, 'ADMIN', 'USER'),
  multerUpload.single('image'),
  validateImageFileRequest(ImageFileValidationSchema, true),
  UserController.updateProfilePicture,
);

router.post(
  '/follow/:id',
  auth(false, 'ADMIN', 'USER'),
  UserController.manageFollowing,
);

router.delete('/:id', auth(false, 'ADMIN', 'USER'), UserController.deleteUser);

export const UserRoutes = router;
