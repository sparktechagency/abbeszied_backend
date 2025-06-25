import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AdminService } from './admin.service';

const createAdmin = catchAsync(async (req, res) => {
     const payload = req.body;
     const result = await AdminService.createAdminToDB(payload);

     sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: 'Admin created Successfully',
          data: result,
     });
});

const deleteAdmin = catchAsync(async (req, res) => {
     const payload = req.params.id;
     const result = await AdminService.deleteAdminFromDB(payload);

     sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: 'Admin Deleted Successfully',
          data: result,
     });
});

const getAdmins = catchAsync(async (req, res) => {
     const result = await AdminService.getAdminsFromDB();
     sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: 'Admin Retrieved Successfully',
          data: result,
     });
});
const getAdmin = catchAsync(async (req, res) => {
     const result = await AdminService.getAdminFromDB();
     sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: 'Admin Retrieved Successfully',
          data: result,
     });
});

export const AdminController = {
     deleteAdmin,
     createAdmin,
     getAdmin,
     getAdmins
};
