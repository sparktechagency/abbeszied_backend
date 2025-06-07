import { Request, Response } from 'express';
import { ReportService } from './report.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { updateFileName } from '../../utils/fileHelper';

const createReport = catchAsync(async (req: Request, res: Response) => {
  req.body.reporterId = req.user?.userId;
  if (req?.file) {
    req.body.image = updateFileName('reports', req?.file?.filename);
  } 
  const result = await ReportService.createReport(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Report created successfully',
    data: result,
  });
});

const getAllReports = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportService.getAllReports(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reports retrieved successfully',
    data: result,
  });
});

const giveWarningReportedPostAuthor = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ReportService.giveWarningReportedPostAuthorToDB(
      id,
      req.body.message,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Report status updated successfully',
      data: result,
    });
  },
);

const deleteReportedPost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ReportService.deleteReportedPost(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Report status updated successfully',
    data: result,
  });
});

export const ReportController = {
  createReport,
  getAllReports,
  deleteReportedPost,
  giveWarningReportedPostAuthor,
};
