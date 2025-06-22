import express from 'express';
import { CertificateManagmentsController } from './certificate.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = express.Router();
router.get(
  '/',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  CertificateManagmentsController.getAllCertificates,
);
router.get(
  '/:id',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  CertificateManagmentsController.getSingleCertificate,
);
router.patch(
  '/:id',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  CertificateManagmentsController.updateStatus,
);
export const CertificateManagmentsRoutes = router;
