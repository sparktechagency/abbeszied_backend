import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { IJwtPayload, TLogin } from './auth.interface';
import config from '../../config';
import bcrypt from 'bcrypt';
import { TUser } from '../user/user.interface';
import { User } from '../user/user.models';
import Otp from '../otp/otp.model';
import { createToken, verifyToken } from '../../utils/tokenManage';
import { generateOptAndExpireTime } from '../otp/otp.utils';
import { otpServices } from '../otp/otp.service';
import { OTPVerifyAndCreateUserProps, userService } from '../user/user.service';
import { otpSendEmail } from '../../utils/eamilNotifiacation';
import { USER_ROLE } from '../user/user.constants';
import { sendNotifications } from '../../helpers/sendNotification';

// Login
const login = async (payload: TLogin) => {
  const user = await User.isUserActive(payload?.email);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }

  if (!(await User.isPasswordMatched(payload.password, user.password))) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password does not match');
  }

  if (user?.status === 'blocked') {
    throw new AppError(httpStatus.BAD_REQUEST, 'User is blocked');
  }
  if (user.role === USER_ROLE.COACH) {
    if (
      user?.verifiedByAdmin === 'pending' ||
      user?.verifiedByAdmin === 'rejected'
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Your account is ${user?.verifiedByAdmin} state. Please contact admin for more information.`,
      );
    }
  }
  await sendNotifications({
    receiver: user?._id,
    type: 'SYSTEM',
    title: 'Login Successful',
    message: 'You have successfully logged in.',
  });
  const jwtPayload: IJwtPayload = {
    fullName: user?.fullName,
    email: user.email,
    phone: user.phone,
    userId: user?._id?.toString() as string,
    role: user?.role,
  };

  const accessToken = createToken({
    payload: jwtPayload,
    access_secret: config.jwt_access_secret as string,
    expity_time: config.jwt_access_expires_in as string,
  });

  const refreshToken = createToken({
    payload: jwtPayload,
    access_secret: config.jwt_refresh_secret as string,
    expity_time: config.jwt_refresh_expires_in as string,
  });

  return {
    user: jwtPayload,
    accessToken,
    refreshToken,
  };
};

// forgot Password
// forgot Password
const forgotPassword = async (email: string) => {
  const user: TUser | null = await User.isUserActive(email);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }

  const { isExist, isExpireOtp } = await otpServices.checkOtpByEmail(email);
  const { otp, expiredAt } = generateOptAndExpireTime();

  if (isExist && !isExpireOtp) {
    throw new AppError(httpStatus.BAD_REQUEST, 'otp-exist. Check your email.');
  } else if (isExist && isExpireOtp) {
    const otpUpdateData = {
      otp,
      expiredAt,
      status: 'pending',
    };

    await otpServices.updateOtpByEmail(email, otpUpdateData);
  } else if (!isExist) {
    await otpServices.createOtp({
      sentTo: email,
      receiverType: 'email',
      otp,
      expiredAt,
    });
  }

  const jwtPayload = {
    email: email,
    userId: user?._id,
  };

  const forgetToken = createToken({
    payload: jwtPayload,
    access_secret: config.jwt_access_secret as string,
    expity_time: config.otp_token_expire_time as string | number,
  });

  // Send email, handle errors so they don't crash your app
  otpSendEmail({
    sentTo: email,
    subject: 'Your one time otp for forget password',
    name: '',
    otp,
    expiredAt,
  }).catch((err) => {
    console.error('Failed to send OTP email:', err);
  });

  return { forgetToken, otp: config.NODE_ENV === 'development' ? otp : '' };
};

// forgot  Password Otp Match
const forgotPasswordOtpMatch = async ({
  otp,
  token,
}: OTPVerifyAndCreateUserProps) => {
  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Token not found');
  }

  const decodeData = verifyToken({
    token,
    access_secret: config.jwt_access_secret as string,
  });
  if (!decodeData) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not authorised');
  }

  const { email } = decodeData;

  const isOtpMatch = await otpServices.otpMatch(email, otp);

  if (!isOtpMatch) {
    throw new AppError(httpStatus.BAD_REQUEST, 'OTP did not match');
  }

  process.nextTick(async () => {
    await otpServices.updateOtpByEmail(email, {
      status: 'verified',
    });
  });

  const user: TUser | null = await User.isUserActive(email);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }

  const jwtPayload = {
    email: email,
    userId: user?._id,
  };

  const forgetOtpMatchToken = createToken({
    payload: jwtPayload,
    access_secret: config.jwt_access_secret as string,
    expity_time: config.otp_token_expire_time as string | number,
  });

  return { forgetOtpMatchToken };
};

// Reset password
const resetPassword = async ({
  token,
  password,
}: {
  token: string;
  password: string;
}) => {
  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Token not found');
  }

  const decodeData = verifyToken({
    token,
    access_secret: config.jwt_access_secret as string,
  });

  if (!decodeData) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not authorised');
  }

  const { email, userId } = decodeData;

  const user: TUser | null = await User.isUserActive(email);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const result = await User.findByIdAndUpdate(
    userId,
    {
      password: hashedPassword,
    },
    { new: true },
  );

  return result;
};

// Change password
const changePassword = async ({
  userId,
  newPassword,
  oldPassword,
}: {
  userId: string;
  newPassword: string;
  oldPassword: string;
}) => {
  const user = await User.IsUserExistById(userId);

  // console.log(userId, newPassword, oldPassword);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!(await User.isPasswordMatched(oldPassword, user.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Old password does not match');
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const result = await User.findByIdAndUpdate(
    userId,
    {
      password: hashedPassword,
    },
    { new: true },
  );

  return result;
};

// Refresh token
const refreshToken = async (token: string) => {
  console.log(token);
  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Token not found');
  }

  const decoded = verifyToken({
    token,
    access_secret: config.jwt_refresh_secret as string,
  });

  const { email } = decoded;

  const activeUser = await User.isUserActive(email);

  if (!activeUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const jwtPayload: {
    userId: string;
    role: string;
    fullName: string;
    email: string;
    phone: string;
  } = {
    fullName: activeUser?.fullName,
    email: activeUser.email,
    phone: activeUser.phone,
    userId: activeUser?._id?.toString() as string,
    role: activeUser?.role,
  };

  const accessToken = createToken({
    payload: jwtPayload,
    access_secret: config.jwt_access_secret as string,
    expity_time: config.jwt_access_expires_in as string,
  });

  return {
    accessToken,
  };
};

export const authServices = {
  login,
  forgotPasswordOtpMatch,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
};
