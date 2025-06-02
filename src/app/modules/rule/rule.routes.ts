import { Router } from 'express';
import { ruleControllers } from './rule.controller';
import validateRequest from '../../middleware/validateRequest';
import { resentRuleValidations } from './rule.validation';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

export const ruleRoutes = Router();

ruleRoutes
  .post(
    '/',
    auth(USER_ROLE.BUSINESS),
    validateRequest(resentRuleValidations.verifyRuleZodSchema),
    ruleControllers.createRuleRule,
  )
  .get('/', auth(USER_ROLE.BUSINESS), ruleControllers.getAllRuleByOwnerId)
  .patch(
    '/:ruleId',

    auth(USER_ROLE.BUSINESS),
    ruleControllers.updateRule,
  )
  .patch(
    '/switch/:ruleId',

    auth(USER_ROLE.BUSINESS),
    ruleControllers.switchRuleStatus,
  )
  .delete('/:ruleId', auth(USER_ROLE.BUSINESS), ruleControllers.deleteRule);
