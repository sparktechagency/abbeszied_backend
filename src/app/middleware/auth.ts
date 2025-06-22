import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync';
import AppError from '../error/AppError';
import config from '../config/index';
import { User } from '../modules/user/user.models';
import { verifyToken } from '../utils/tokenManage';
import { USER_ROLE } from '../modules/user/user.constants';

const auth = (...userRoles: string[]) => {
  return catchAsync(async (req, res, next) => {
    const tokenWithBearer = req.headers.authorization;

    if (!tokenWithBearer) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized !!');
    }
    if (!tokenWithBearer.startsWith('Bearer')) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Token send is not valid !!');
    }
    const token = tokenWithBearer?.split(' ')[1];
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'you are not authorized!');
    }

    const decodeData = verifyToken({
      token,
      access_secret: config.jwt_access_secret as string,
    });

    const { role, userId } = decodeData;
    const isUserExist = await User.IsUserExistById(userId);

    // console.log({ role, userId });

    if (!isUserExist) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'user not found');
    }
    if (isUserExist?.status === 'blocked') {
      throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked !!');
    }
    if (isUserExist.role === USER_ROLE.COACH) {
      if (
        isUserExist?.verifiedByAdmin === 'pending' ||
        isUserExist?.verifiedByAdmin === 'rejected'
      ) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Your account is ${isUserExist?.verifiedByAdmin} state. Please contact admin for more information.`,
        );
      }
    }
    if (isUserExist?.isDeleted) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'This user accaunt is deleted !!',
      );
    }
    if (userRoles && !userRoles.includes(role)) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'You are not authorized this api',
      );
    }
    req.user = decodeData;
    next();
  });
};
export default auth;
