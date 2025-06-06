import express from 'express';
import { Productcontroller } from './store.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { ProductValidation } from './store.validation';
import { USER_ROLE } from '../user/user.constants';
import fileUpload from '../../middleware/fileUpload';
import parseData from '../../middleware/parseData';
const upload = fileUpload('./public/uploads/product');

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLE.CLIENT, USER_ROLE.COACH),
  upload.fields([{ name: 'images', maxCount: 5 }]),
  parseData(),
  validateRequest(ProductValidation.productValidationSchema),
  Productcontroller.addProduct,
);
router.patch(
  '/product-update/:id',
  auth(USER_ROLE.CLIENT, USER_ROLE.COACH),
  upload.fields([{ name: 'images', maxCount: 5 }]),
  parseData(),
  validateRequest(ProductValidation.productValidationSchema),
  Productcontroller.updateProduct,
);
router.get(
  '/my-listing',
  auth(USER_ROLE.CLIENT, USER_ROLE.COACH),
  Productcontroller.getMyProducts,
);

router.get(
  '/products',
  auth(USER_ROLE.CLIENT, USER_ROLE.COACH),
  Productcontroller.getAllProducts,
);

router.get(
  '/product/:id',
  auth(USER_ROLE.CLIENT, USER_ROLE.COACH),
  Productcontroller.getProduct,
);
router.patch(
  '/mark-sold/:id',
  auth(USER_ROLE.COACH, USER_ROLE.CLIENT),
  Productcontroller.markSold,
);
router.delete(
  '/delete/:id',
  auth(USER_ROLE.COACH, USER_ROLE.CLIENT),
  Productcontroller.deleteProduct,
);
export const storeRouter = router;
