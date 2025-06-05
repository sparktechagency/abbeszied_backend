import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SupportService } from './support.service';

const addSupport = catchAsync(async (req, res) => {
     const result = await SupportService.upsertSupport(req.body);
     sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: 'Support added successfully',
          data: result,
     });
});

const getSupport = catchAsync(async (req, res): Promise<void> => {
     const result = await SupportService.getSupport();
     sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: 'Support get successfully',
          data: result,
     });
});

export const SupportController = {
     addSupport,
     getSupport,
};
