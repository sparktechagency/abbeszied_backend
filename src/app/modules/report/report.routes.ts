import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import { ReportController } from './report.controller';
import auth from '../../middleware/auth';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parseSingleFileData from '../../middleware/parseFileData';
const router = express.Router();

router.post(
     '/',
     auth(USER_ROLES.USER),
     fileUploadHandler(),
     parseSingleFileData,
     ReportController.createReport,
);
router.get(
     '/statistics',
     auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
     ReportController.getReportedIssuesStatistics,
);
router.get('/', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), ReportController.getAllReports);
router.get(
     '/:reportId',
     auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
     ReportController.getReportById,
);

router.put(
     '/:reportId/status',
     auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
     ReportController.updateReportStatus,
);
// Route for deleting a report
router.delete(
     '/:reportId',
     auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
     ReportController.deleteReport,
);

export const ReportRoutes = router;
