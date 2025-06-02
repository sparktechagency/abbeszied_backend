import { Router } from 'express';
import { paymenController } from './payment.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

export const paymentRoutes = Router();

paymentRoutes
  .post('/', auth(USER_ROLE.USER), paymenController.createPayment)
  .get(
    '/',
    auth(USER_ROLE.USER, USER_ROLE.BUSINESS, USER_ROLE.ADMIN),
    paymenController.getPaymentByCustomer,
  )
  .get(
    '/last-12-months-earnings',
    auth(USER_ROLE.BUSINESS, USER_ROLE.ADMIN),
    paymenController.getLast12MonthsEarnings,
  )
  .get('/success', paymenController.successPage)
  .get('/cancel', paymenController.cancelPage);
