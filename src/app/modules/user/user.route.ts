import { Router } from 'express';
import auth from '../../middleware/auth';
import { UserController } from './user.scontroller';
import validateRequest from '../../middleware/validateRequest';
import { UserValidation } from './user.validation';

const router = Router();

/*
User 
1. Get all users(ADMIN)         "/users/all"
2. Update user role(ADMIN)      "/users/change-role/userId"
3. Get single User(Any Person)  "/users/userId"
4. Get my information(Only me)  "/users/me"
6. Manage users follow          "/users/follow/userId"
5. Delete user(Admin | Only user himself)   "/users/userId"
*/

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
router.get(
  '/me',
  auth(false, 'ADMIN', 'USER'),
  UserController.getMyInformation,
);
// update my information
router.patch(
  '/update-me',
  validateRequest(UserValidation.updateUserInfoValidationSchema),
  auth(false, 'ADMIN', 'USER'),
  UserController.updateMyself,
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
