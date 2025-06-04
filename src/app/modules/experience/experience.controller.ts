import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { experienceService } from './experience.service';
import { FilesObject } from '../../interface/common.interface';
import { updateFileName } from '../../utils/fileHelper';

const addWorkHistory = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await experienceService.addWorkHistory({
    ...req.body,
    userId,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Work history added successfully',
    data: result,
  });
});

const updateWorkHistory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await experienceService.updateWorkHistory(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Work history updated successfully',
    data: result,
  });
});

const deleteWorkHistory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.user;
  const result = await experienceService.deleteWorkHistory(id, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Work history deleted successfully',
    data: result,
  });
});

const getUserWorkHistory = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await experienceService.getUserWorkHistory(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Work history retrieved successfully',
    data: result,
  });
});

const addCertificate = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { files } = req as Request & { files: FilesObject };

  const certificateFile = files.certificateFile?.[0]?.filename
    ? updateFileName('certificates', files.certificateFile[0].filename)
    : '';

  const result = await experienceService.addCertificate({
    ...req.body,
    certificateFile,
    userId,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Certificate added successfully',
    data: result,
  });
});

const updateCertificate = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { files } = req as Request & { files: FilesObject };

  let payload = { ...req.body };
  if (files?.certificateFile?.[0]?.filename) {
    payload.certificateFile = updateFileName(
      'certificates',
      files.certificateFile[0].filename,
    );
  }

  const result = await experienceService.updateCertificate(id, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Certificate updated successfully',
    data: result,
  });
});

const deleteCertificate = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.user;
  const result = await experienceService.deleteCertificate(id, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Certificate deleted successfully',
    data: result,
  });
});

const getUserCertificates = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await experienceService.getUserCertificates(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Certificates retrieved successfully',
    data: result,
  });
});

export const experienceController = {
  addWorkHistory,
  updateWorkHistory,
  deleteWorkHistory,
  getUserWorkHistory,
  addCertificate,
  updateCertificate,
  deleteCertificate,
  getUserCertificates,
};
