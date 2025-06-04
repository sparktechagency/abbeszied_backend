import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
const parseData = () => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (req?.body?.data) {
      req.body = JSON.parse(req.body.data);
    }

    if (req.body?.locationLatLong) {
      req.body.locationLatLong = JSON.parse(req.body.locationLatLong);
    }
    if (req.body?.traningVanue) {
      req.body.traningVanue = JSON.parse(req.body.traningVanue);
    }
    if (req.body?.availableDays) {
      req.body.availableDays = JSON.parse(req.body.availableDays);
    }
    if (req.body?.interests) {
      req.body.interests = JSON.parse(req.body.interests);
    }

    next();
  });
};
export default parseData;
