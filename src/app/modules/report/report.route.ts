import express from 'express';
import { ReportController } from './report.controller';
import { ReportValidation } from './report.validation';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import fileUpload from '../../middleware/fileUpload';
import parseData from '../../middleware/parseData';
const upload = fileUpload('./public/uploads/reports');
const router = express.Router();

router.post(
  '/create-report',
  auth(USER_ROLE.CLIENT, USER_ROLE.COACH),
  upload.single('image'),
  parseData(),
  ReportController.createReport,
);

router.patch(
  '/give-warning/:id',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  validateRequest(ReportValidation.warningReportZodSchema),
  ReportController.giveWarningReportedPostAuthor,
);

router.get(
  '/',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  ReportController.getAllReports,
);

router.patch(
  '/delete-post/:id',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  ReportController.deleteReportedPost,
);

export const reportRoutes = router;
