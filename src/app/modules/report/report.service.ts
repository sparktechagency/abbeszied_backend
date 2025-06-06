import { StatusCodes } from 'http-status-codes';
import { IReport } from './report.interface';
import { Report } from './report.model';
import AppError from '../../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';

const createReportToDB = async (payload: IReport): Promise<IReport> => {
     const report = await Report.create(payload);
     if (!report) throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to created Report ');
     return report;
};
// Get all reports
const getAllReports = async (query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(
          Report.find({})
               .populate('sellerId', 'name image')
               .populate('customerId', 'name image location'),
          query,
     );
     const reports = await queryBuilder
          .search(['location', 'title', 'category'])
          .filter()
          .sort()
          .paginate()
          .fields()
          .modelQuery.exec();

     const meta = await queryBuilder.countTotal();

     return { reports, meta };
};

// Get a report by ID
const getReportById = async (reportId: string): Promise<IReport | null> => {
     const report = await Report.findById(reportId);
     if (!report) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Report not found');
     }
     return report;
};
// Update report status
const updateReportStatus = async (reportId: string, status: string): Promise<IReport> => {
     if (!status || !['under review', 'resolved'].includes(status)) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid status value');
     }
     const updatedReport = await Report.findByIdAndUpdate(reportId, { status }, { new: true });

     if (!updatedReport) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Report not found');
     }
     return updatedReport;
};
// Delete a report
const deleteReport = async (reportId: string): Promise<void> => {
     const deletedReport = await Report.findByIdAndDelete(reportId);

     if (!deletedReport) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Report not found');
     }
};

//  get Statistics for reported issues
const getReportedIssuesStatistics = async (query: Record<string, unknown>) => {
     const matchFilter: any = {};

     if (query?.location) {
          matchFilter.location = query.location;
     }

     const monthQuery = query?.month as string;

     if (monthQuery) {
          const [year, month] = monthQuery.split('-');
          if (!year || !month || month.length !== 2 || year.length !== 4) {
               throw new AppError(
                    StatusCodes.BAD_REQUEST,
                    'Invalid month format. Use YYYY-MM format.',
               );
          }

          const startDate = new Date(Number(year), Number(month) - 1, 1);
          const endDate = new Date(Number(year), Number(month), 0);

          matchFilter.createdAt = { $gte: startDate, $lte: endDate };
     }

     const statistics = await Report.aggregate([
          {
               $match: matchFilter,
          },
          {
               $group: {
                    _id: {
                         month: { $month: '$createdAt' },
                         year: { $year: '$createdAt' },
                         status: '$status',
                    },
                    count: { $sum: 1 },
               },
          },
          {
               $sort: { '_id.year': 1, '_id.month': 1 },
          },
          {
               $project: {
                    _id: 0,
                    month: '$_id.month',
                    year: '$_id.year',
                    status: '$_id.status',
                    count: 1,
               },
          },
     ]);

     // if (!statistics || statistics.length === 0) {
     //   throw new AppError(StatusCodes.NOT_FOUND, 'No statistics found');
     // }

     const result = statistics.reduce((acc: any, curr: any) => {
          const { month, status, count } = curr;

          if (!acc[month]) {
               acc[month] = {
                    'under review': 0,
                    'resolved': 0,
               };
          }

          // Increment the count based on the status
          acc[month][status] = count;
          return acc;
     }, {});

     // Ensure that every month from 1 to 12 has the status structure
     for (let month = 1; month <= 12; month++) {
          if (!result[month]) {
               result[month] = {
                    'under review': 0,
                    'resolved': 0,
               };
          }
     }

     return result;
};

export const ReportService = {
     createReportToDB,
     getAllReports,
     getReportById,
     updateReportStatus,
     deleteReport,
     getReportedIssuesStatistics,
};
