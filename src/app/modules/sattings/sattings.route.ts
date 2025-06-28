import express from 'express';
import { settingsController } from './sattings.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const SettingsRouter = express.Router();

SettingsRouter.put(
     '/',
     auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
     settingsController.addSetting,
)
     .get('/', settingsController.getSettings)
     .get('/privacy-policy', settingsController.getPrivacyPolicy)
     .get('/account-delete-policy', settingsController.getAccountDelete)
     .get('/support', settingsController.getSupport);

export default SettingsRouter;
