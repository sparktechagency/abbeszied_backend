import express from 'express';
import { BannerController } from './banner.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import parseData from '../../middleware/parseData';
import fileUpload from '../../middleware/fileUpload';
const upload = fileUpload('./public/uploads/banners');

const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    upload.single('image'),
    parseData(),
    BannerController.createBanner,
  )
  .get(
    auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    BannerController.getAllBanner,
  );

router.get('/client', auth(USER_ROLE.CLIENT), BannerController.getClientBanner);
router.get(
  '/corporate',
  auth(USER_ROLE.CORPORATE),
  BannerController.getCorporateBanner,
);
router.get(
  '/client-store',
  auth(USER_ROLE.CORPORATE),
  BannerController.getClientStoreBanner,
);
router.get(
  '/coach-store',
  auth(USER_ROLE.CORPORATE),
  BannerController.getCoachStoreBanner,
);

router
  .route('/:id')
  .patch(
    auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    upload.single('image'),
    parseData(),
    BannerController.updateBanner,
  )
  .delete(
    auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    BannerController.deleteBanner,
  );

export const BannerRoutes = router;
