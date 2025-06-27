import { Report } from './report.model';
import { IReport } from './report.interface';
import mongoose from 'mongoose';
import Product from '../store/store.model';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.models';
import { USER_ROLE } from '../user/user.constants';
import { sendNotifications } from '../../helpers/sendNotification';
import { reportWarning } from '../../utils/eamilNotifiacation';

const createReport = async (payload: IReport) => {
  const product = await Product.findById(payload.produtId);
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  const result = await Report.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create report');
  }
//   const getAdmin = await User.findOne({ role: USER_ROLE.SUPER_ADMIN });
//   if (!getAdmin) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Admin not found');
//   }
//   await sendNotifications({
//     recipientRole: 'ADMIN',
//     message: `A user has reported a product ${product.name}`,
//     type: 'info',
//     receiver: getAdmin._id,
//   });
  await sendNotifications({
    recipientRole: 'USER',
    message: `Your product ${product.name} has been reported`,
    type: 'info',
    receiver: product.sellerId,
  });
  //@ts-ignore
  //   const io = global.io;
  //   if (io) {
  //     io.emit(`notification::${product.sellerId.toString()}`, userNotification);
  //     io.emit(`notification::${getAdmin._id}`, adminNotification);
  //   }

  return result;
};

const getAllReports = async (query: Record<string, any>) => {
  const reportQuery = new QueryBuilder(
    Report.find()
      .populate({
        path: 'postId',
        select: 'title images author',
        populate: {
          path: 'author',
          select: 'userName email',
        },
      })
      .populate({
        path: 'reporterId',
        select: 'userName email',
      }),
    query,
  )
    .search(['reason', 'description'])

    .filter()
    .sort()
    .paginate();

  const result = await reportQuery.modelQuery;
  const meta = await reportQuery.countTotal();

  return {
    meta,
    result,
  };
};

const giveWarningReportedPostAuthorToDB = async (
  reportId: string,
  message: string,
) => {
  const report = await Report.findById(reportId);
  if (!report) {
    throw new AppError(httpStatus.NOT_FOUND, 'Report not found');
  }

  const product = await Product.findById(report.produtId);
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  const seller = await User.findById(product.sellerId);
  if (!seller) {
    throw new AppError(httpStatus.NOT_FOUND, 'Seller not found');
  }

  const result = await Report.findByIdAndUpdate(reportId, {
    status: 'reviewed',
    new: true,
    runValidators: true,
  });
  const reportData = {
    name: seller.fullName,
    email: seller.email,
    produtcName: product.name,
    message: message,
  };
  await sendNotifications({
    recipientRole: 'USER',
    message: `Your product ${product.name} has been reported`,
    type: 'info',
    receiver: product.sellerId,
  });
  //@ts-ignore
  //   const io = global.io;
  //   if (io) {
  //     io.emit(`notification::${product.sellerId.toString()}`, notification);
  //   }
  process.nextTick(async () => {
    await reportWarning({
      sentTo: reportData.email,
      subject: 'Community Guidelines Warning: Action Required',
      name: reportData.produtcName,
      seller: reportData.name,
      message: reportData.message,
    });
  });
  return result;
};

const deleteReportedPost = async (reportId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const isExist = await Report.findById(reportId).session(session);
    if (!isExist) {
      throw new AppError(httpStatus.NOT_FOUND, 'Report not found');
    }

    await Product.findByIdAndUpdate(
      isExist.produtId,
      { isDeleted: true },
      { session },
    );

    await Report.deleteOne({ _id: isExist._id }, { session });
    await Report.findByIdAndUpdate(
      isExist._id,
      {
        status: 'resolved',
      },
      { session, runValidators: true, new: true },
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const ReportService = {
  createReport,
  getAllReports,
  deleteReportedPost,
  giveWarningReportedPostAuthorToDB,
};
