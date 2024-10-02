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
// All users infromation
router.get('/all', auth(false, 'ADMIN'), UserController.getAllUsers);
// Users change role
router.patch(
  '/change-role/:id',
  auth(false, 'ADMIN'),
  UserController.updateUserRole,
);

// Get single user information by any user
router.get('/:id', UserController.getSingleUser);

// Authorized Person access
// Get only my all information
router.get('/me', auth(false, 'ADMIN', 'USER'), UserController.getMe);
// update my information
router.patch(
  '/update-me',
  validateRequest(UserValidation.updateUserInfoValidationSchema),
  auth(false, 'ADMIN', 'USER'),
  UserController.updateMe,
);
// update profile picture
router.patch(
  '/update-profile-picture',
  auth(false, 'ADMIN', 'USER'),
  multerUpload.single('image'),
  validateImageFileRequest(ImageFileValidationSchema, true),
  UserController.updateProfilePicture,
);
// Update Cover picture
router.patch(
  '/update-cover-picture',
  auth(false, 'ADMIN', 'USER'),
  multerUpload.single('image'),
  validateImageFileRequest(ImageFileValidationSchema, true),
  UserController.updateCoverPicture,
);

// update my following | followers
router.post(
  '/follow/:id',
  auth(false, 'ADMIN', 'USER'),
  UserController.manageFollow,
);
// delete myself. Myself can get also deleted by admin
router.delete('/:id', auth(false, 'ADMIN', 'USER'), UserController.deleteUser);

export const UserRoutes = router;
