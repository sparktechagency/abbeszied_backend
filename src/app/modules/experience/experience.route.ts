import express from 'express';
import { experienceController } from './experience.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import fileUpload from '../../middleware/fileUpload';
import validateRequest from '../../middleware/validateRequest';
import { experienceValidation } from './experience.validation';

const upload = fileUpload('./public/uploads/certificates');
const experienceRoutes = express.Router();

// Work History Routes
experienceRoutes
  .post(
    '/work-history',
    auth(USER_ROLE.COACH),
    validateRequest(experienceValidation.workHistoryValidationSchema),
    experienceController.addWorkHistory,
  )
  .patch(
    '/work-history/:id',
    auth(USER_ROLE.COACH),
    experienceController.updateWorkHistory,
  )
  .delete(
    '/work-history/:id',
    auth(USER_ROLE.COACH),
    experienceController.deleteWorkHistory,
  )
  .get(
    '/work-history',
    auth(USER_ROLE.COACH),
    experienceController.getUserWorkHistory,
  );

// Certificate Routes
experienceRoutes
  .post(
    '/certificate',
    auth(USER_ROLE.COACH),
    upload.fields([{ name: 'certificateFile', maxCount: 1 }]),
    validateRequest(experienceValidation.certificateValidationSchema),
    experienceController.addCertificate,
  )
  .patch(
    '/certificate/:id',
    auth(USER_ROLE.COACH),
    upload.fields([{ name: 'certificateFile', maxCount: 1 }]),
    experienceController.updateCertificate,
  )
  .delete(
    '/certificate/:id',
    auth(USER_ROLE.COACH),
    experienceController.deleteCertificate,
  )
  .get(
    '/certificate',
    auth(USER_ROLE.COACH),
    experienceController.getUserCertificates,
  );

export default experienceRoutes;