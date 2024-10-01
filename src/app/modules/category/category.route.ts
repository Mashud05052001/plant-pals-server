import { Router } from 'express';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { CategoryValidation } from './category.validation';
import { CategoryController } from './category.scontroller';

const router = Router();

router.post(
  '/',
  validateRequest(CategoryValidation.createCategoryValidationSchema),
  auth(false, 'ADMIN'),
  CategoryController.createCategory,
);

router.get('/', CategoryController.getAllCategories);
router.patch(
  '/:id',
  validateRequest(CategoryValidation.createCategoryValidationSchema),
  auth(false, 'ADMIN'),
  CategoryController.updateCategory,
);
router.delete('/:id', auth(false, 'ADMIN'), CategoryController.deleteCategory);
router.delete(
  '/',
  auth(false, 'ADMIN'),
  CategoryController.deleteAllCategories,
);

export const CategoryRoutes = router;
