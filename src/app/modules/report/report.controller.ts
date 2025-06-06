import catchAsync from '../../../shared/catchAsync';
import { ReportService } from './report.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const createReport = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const payload = {
          customerId: id,
          ...req.body,
     };
     const result = await ReportService.createReportToDB(payload);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Report created Successfully',
          data: result,
     });
});
// Get all reports
const getAllReports = catchAsync(async (req, res) => {
     const reports = await ReportService.getAllReports(req.query);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Reports retrieved successfully',
          data: reports,
     });
});
// Get a report by ID
const getReportById = catchAsync(async (req, res) => {
     const { reportId } = req.params;
     const report = await ReportService.getReportById(reportId);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Report retrieved successfully',
          data: report,
     });
});
// Update report status
const updateReportStatus = catchAsync(async (req, res) => {
     const { reportId } = req.params;
     const { status } = req.body;

     const updatedReport = await ReportService.updateReportStatus(reportId, status);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Report status updated successfully',
          data: updatedReport,
     });
});
// Delete report
const deleteReport = catchAsync(async (req, res) => {
     const { reportId } = req.params;

     await ReportService.deleteReport(reportId);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Report deleted successfully',
     });
});

const getReportedIssuesStatistics = catchAsync(async (req, res) => {
     const query = req.query;
     const statistics = await ReportService.getReportedIssuesStatistics(query);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Reported issues statistics fetched successfully',
          data: statistics,
     });
});

export const ReportController = {
     createReport,
     getAllReports,
     getReportById,
     updateReportStatus,
     deleteReport,
     getReportedIssuesStatistics,
};
