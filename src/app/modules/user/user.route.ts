import { Router } from 'express';
import auth from '../../middleware/auth';
import { UserController } from './user.scontroller';

const router = Router();

router.post(
  '/follow/:id',
  auth(false, 'ADMIN', 'USER'),
  UserController.manageFollow,
);

router.patch('/:id', auth(false, 'ADMIN'), UserController.updateUserRole);
router.delete('/:id', auth(false, 'ADMIN'), UserController.deleteUser);

export const UserRoutes = router;
