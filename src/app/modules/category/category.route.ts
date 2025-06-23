import express from 'express';
import { CategoryController } from './category.controller';
import { CategoryValidation } from './category.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import parseData from '../../middleware/parseData';
import fileUpload from '../../middleware/fileUpload';
const upload = fileUpload('./public/uploads/category');
const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  upload.single('image'),
  parseData(),
  validateRequest(CategoryValidation.createCategoryZodSchema),
  CategoryController.createCategory,
);

router
  .route('/:id')
  .patch(
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
    upload.single('image'),
    parseData(),
    CategoryController.updateCategory,
  )
  .delete(
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
    CategoryController.deleteCategory,
  );

router.get(
  '/',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  CategoryController.getCategories,
);
router.get(
  '/client',
  CategoryController.getClientCategory,
);
router.get(
  '/coach',
  CategoryController.getCoachCategory,
);

export const CategoryRoutes = router;
