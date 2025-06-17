import express from 'express';
import { JobPostController } from './jobPost.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import { JobPostValidation } from './jobPost.validation';
import parseData from '../../middleware/parseData';
import fileUpload from '../../middleware/fileUpload';
const router = express.Router();
const upload = fileUpload('./public/uploads/applications');
router
  .route('/create')
  .post(
    auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN, USER_ROLE.CORPORATE),
    validateRequest(JobPostValidation.createJobPostZodSchema),
    JobPostController.createJobPost,
  );

router.get('/', auth(USER_ROLE.COACH), JobPostController.getAllJobPosts);
router.get(
  '/get-my-posts',
  auth(USER_ROLE.CORPORATE),
  JobPostController.getMyJobPosts,
);
router.post(
  '/apply-job/:id',
  upload.single('application'),
  parseData(),
  auth(USER_ROLE.COACH),
  JobPostController.applyJob,
);
router.get(
  '/get-applications/:id',
  auth(USER_ROLE.CORPORATE),
  JobPostController.getApplication,
);
router
  .route('/:id')
  .get(JobPostController.getJobPostById)
  .patch(
    auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN, USER_ROLE.CORPORATE),
    validateRequest(JobPostValidation.updateJobPostZodSchema),
    JobPostController.updateJobPost,
  )
  .delete(
    auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN, USER_ROLE.CORPORATE),
    JobPostController.deleteJobPost,
  );

export const JobPostRoutes = router;
