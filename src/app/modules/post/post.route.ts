import { Router } from 'express';
import auth from '../../middleware/auth';
import { multerUpload } from '../../config/multer.config';
import validateRequest from '../../middleware/validateRequest';
import { parseBody } from '../../middleware/bodyParser';
import { PostValidation } from './post.validation';
import validateImageFileRequest from '../../middleware/validateImageFileRequest';
import {
  IMAGE_MAX_IMAGE_COUNT,
  ImageFilesArrayValidationSchema,
} from '../../zod/image.validation';
import { PostController } from './post.scontroller';

const router = Router();

router.post(
  '/',
  auth(false, 'ADMIN', 'USER'),

  multerUpload.fields([{ name: 'images', maxCount: IMAGE_MAX_IMAGE_COUNT }]),
  validateImageFileRequest(ImageFilesArrayValidationSchema, false),
  parseBody,
  validateRequest(PostValidation.createPostValidationSchema),
  PostController.createPost,
);

router.get('/', PostController.getAllPosts);

router.get('/:id', PostController.getSinglePost);

router.patch(
  '/:id',
  validateRequest(PostValidation.updatePostValidationSchema),
  auth(false, 'ADMIN', 'USER'),
  PostController.updatePost,
);
router.delete('/:id', auth(false, 'ADMIN', 'USER'), PostController.deletePost);

router.post(
  '/vote',
  validateRequest(PostValidation.voatingValidationSchema),
  auth(false, 'ADMIN', 'USER'),
  PostController.manageVoating,
);

export const PostRoutes = router;
