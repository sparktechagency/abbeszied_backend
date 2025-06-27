import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { CertificateManagmentsService } from './certificate.service';

const getAllCertificates = catchAsync(async (req, res) => {
  const result = await CertificateManagmentsService.getAllCertificates(
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Certificates retrieved successfully',
    data: result.result,
    meta: result.meta,
  });
});

const getSingleCertificate = catchAsync(async (req, res) => {
  const result = await CertificateManagmentsService.getSingleCertificate(
    req.params.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Certificate retrieved successfully',
    data: result,
  });
});
const updateStatus = catchAsync(async (req, res) => {
  const { verifiedByAdmin } = req.body;
  const result = await CertificateManagmentsService.updateStatus(
    req.params.id,
    verifiedByAdmin,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Certificate status updated successfully',
    data: result.updateResult,
  });
});
export const CertificateManagmentsController = {
  getAllCertificates,
  getSingleCertificate,
  updateStatus,
  //   deleteCertificate,
  //   deleteMultipleCertificates,
  //   changeCertificateStatus,
};
