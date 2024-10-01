import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { UserRoutes } from '../modules/user/user.route';
import { CategoryRoutes } from '../modules/category/category.route';
import { PostRoutes } from '../modules/post/post.route';
import { CommentsRoutes } from '../modules/comment/comment.route';

const router = Router();

const moduleRoutes = [
  { path: '/auth', element: AuthRoutes },
  { path: '/users', element: UserRoutes },
  { path: '/posts', element: PostRoutes },
  { path: '/category', element: CategoryRoutes },
  { path: '/comments', element: CommentsRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.element));

export const AllRoutes = router;
