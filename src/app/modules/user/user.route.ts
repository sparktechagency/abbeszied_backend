import { Router } from 'express';
import { userController } from './user.controller';
import validateRequest from '../../middleware/validateRequest';
import { userValidation } from './user.validation';
import auth from '../../middleware/auth';
import { USER_ROLE } from './user.constants';
import parseData from '../../middleware/parseData';
import fileUpload from '../../middleware/fileUpload';
const upload = fileUpload('./public/uploads/profile');

export const userRoutes = Router();

userRoutes
  .post(
    '/create',
    upload.fields([{ name: 'cerificates', maxCount: 5 }]),
    (req, res, next) => {
      console.log(req.body);
      next();
    },
    parseData(),
    validateRequest(userValidation?.userValidationSchema),
    userController.createUser,
  )
  .get(
    '/my-profile',
    auth(
      USER_ROLE.CLIENT,
      USER_ROLE.COACH,
      USER_ROLE.CORPORATE,
      USER_ROLE.ADMIN,
      USER_ROLE.SUPER_ADMIN,
    ),
    userController.getMyProfile,
  )
  // .get('/all-users', auth(USER_ROLE.ADMIN), userController.getAllUsers)
  // .get('/all-users-count', userController.getAllUserCount)
  // .get('/all-users-rasio', userController.getAllUserRasio)
  // .get('/:id', userController.getUserById)
  .patch(
    '/update-my-profile',
    auth(
      USER_ROLE.CLIENT,
      USER_ROLE.COACH,
      USER_ROLE.ADMIN,
      USER_ROLE.CORPORATE,
      USER_ROLE.SUPER_ADMIN,
    ),
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'introVideo', maxCount: 1 },
    ]),
    validateRequest(userValidation?.userupdateValidationSchema),
    parseData(),
    userController.updateMyProfile,
  )
  .patch(
    '/switch-status/:businessId',
    auth(USER_ROLE.ADMIN),
    userController.updateOwnerStatus,
  )
  .delete(
    '/delete-my-account',
    auth(
      USER_ROLE.COACH,
      USER_ROLE.CLIENT,
      USER_ROLE.CORPORATE,
      USER_ROLE.ADMIN,
    ),
    userController.deleteMyAccount,
  )
  .delete(
    '/:id',
    auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    userController.blockedUser,
  );
