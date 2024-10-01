import { Router } from 'express';
import auth from '../../middleware/auth';
import { UserController } from './user.scontroller';

const router = Router();

router.post(
  '/follow/:id',
  auth(false, 'ADMIN', 'USER'),
  UserController.manageFollow,
);

export const UserRoutes = router;
