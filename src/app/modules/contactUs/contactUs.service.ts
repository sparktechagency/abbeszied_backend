import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import { TContactUs } from './contactUs.interface';
import { ContactUs } from './contactUs.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { notificationService } from '../notification/notification.service';
import { io } from '../../../server';

const createContactUsService = async (payload: TContactUs, userId) => {
  const result = await ContactUs.create(payload);

  // let message = 'User want to contact';
  // await notificationService.createNotification({
  //   message,
  //   userId,
  // });

  // io.emit('notiffication::admin', { success: true, message });

  return result;
};

const getAllContactUsService = async (query: Record<string, unknown>) => {
  const allContactUs = new QueryBuilder(ContactUs.find({}), query)
    .sort()
    .paginate();

  const result = await allContactUs.modelQuery;
  const meta = await allContactUs.countTotal();

  return { meta, result };
};

export const contactUsService = {
  createContactUsService,
  getAllContactUsService,
};
