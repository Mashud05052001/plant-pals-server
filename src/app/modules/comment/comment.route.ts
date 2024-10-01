import { Router } from 'express';
import { CommentsController } from './comment.scontroller';
import auth from '../../middleware/auth';
import { CommentsValidation } from './comment.validation';
import validateRequest from '../../middleware/validateRequest';

const router = Router();

router.post(
  '/',
  validateRequest(CommentsValidation.createCommentValidationSchema),
  auth(false, 'ADMIN', 'USER'),
  CommentsController.createComment,
);

router.get('/:postId', CommentsController.getAllCommentsOfAPost);

router.patch(
  '/:commentId',
  validateRequest(CommentsValidation.updateCommentValidationSchema),
  auth(false, 'ADMIN', 'USER'),
  CommentsController.updateComment,
);
router.delete(
  '/:commentId',
  auth(false, 'ADMIN', 'USER'),
  CommentsController.deleteComment,
);

export const CommentsRoutes = router;
