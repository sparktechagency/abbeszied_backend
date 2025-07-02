import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { DeleteAccountPayload, TUser, TCoachCreate } from './user.interface';
import { User } from './user.models';
import { USER_ROLE } from './user.constants';
import config from '../../config';
import QueryBuilder from '../../builder/QueryBuilder';
import { otpServices } from '../otp/otp.service';
import { userCreateEmail } from '../../utils/eamilNotifiacation';
import { createToken, verifyToken } from '../../utils/tokenManage';
import { IJwtPayload } from '../auth/auth.interface';
import { Certificate } from '../experience/experience.models';
import { Category } from '../category/category.model';

export type IFilter = {
  searchTerm?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export interface OTPVerifyAndCreateUserProps {
  otp: string;
  token: string;
}

const createUserToken = async (payload: TCoachCreate) => {
  const { email, role, fullName, cerificates } = payload;
  console.log('payload', payload);
  if (
    !(
      role === USER_ROLE.CLIENT ||
      role === USER_ROLE.COACH ||
      role === USER_ROLE.CORPORATE
    )
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid data!');
  }
  if (role === USER_ROLE.CLIENT && !payload.interests?.length) {
    throw new AppError(httpStatus.BAD_REQUEST, 'interests data is required!');
  }
  // user exist check
  const userExist = await userService.getUserByEmail(email);

  if (userExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already exist!!');
  }
  try {
    if (payload.role === USER_ROLE.COACH) {
      const findCategory = await Category.findOne({
        name: payload.category,
        type: 'coach',
      });

      if (!findCategory) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Category not found!');
      }

      // Increment the count field
      findCategory.count += 1;

      // Save the updated category
      await findCategory.save();
    }
  } catch (error) {
    console.log(error);
  }

  // send email
  process.nextTick(async () => {
    await userCreateEmail({
      sentTo: email,
      subject: 'Your one time otp for email  verification',
      name: fullName,
    });
  });

  const user = await User.create(payload);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User creation failed');
  }
  // Create certificates if provided
  if (cerificates && cerificates.length > 0) {
    const certificatePromises = cerificates.map((certificateFile) => {
      return Certificate.create({
        certificateFile,
        userId: user._id,
      });
    });
    await Promise.all(certificatePromises);
  }

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

const otpVerifyAndCreateUser = async ({
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

  const { password, email, fullName, role } = decodeData;

  if (!(role === 'user' || role === 'business')) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Provide valid data');
  }

  const isOtpMatch = await otpServices.otpMatch(email, otp);

  if (!isOtpMatch) {
    throw new AppError(httpStatus.BAD_REQUEST, 'OTP did not match');
  }

  process.nextTick(async () => {
    await otpServices.updateOtpByEmail(email, {
      status: 'verified',
    });
  });

  const userData = {
    password,
    email,
    fullName,
    role,
  };

  const isExist = await User.isUserExist(email as string);

  if (isExist) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'User already exists with this email',
    );
  }

  const user = await User.create(userData);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User creation failed');
  }

  return user;
};

// ............................rest

const getAllUserQuery = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(User.find() as any, query)
    .search(['fullName', 'email', 'phone', 'role'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await queryBuilder.modelQuery.exec();
  const meta = await queryBuilder.countTotal();
  return { meta, result };
};

const getAllUserCount = async () => {
  const allUserCount = await User.countDocuments();
  return allUserCount;
};

const getAllUserRatio = async (year: number) => {
  const startOfYear = new Date(year, 0, 1); // January 1st of the given year
  const endOfYear = new Date(year + 1, 0, 1); // January 1st of the next year

  // Create an array with all 12 months to ensure each month appears in the result
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    userCount: 0, // Default count of 0
  }));

  const userRatios = await User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfYear,
          $lt: endOfYear,
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' }, // Group by month (1 = January, 12 = December)
        userCount: { $sum: 1 }, // Count users for each month
      },
    },
    {
      $project: {
        month: '$_id', // Rename the _id field to month
        userCount: 1,
        _id: 0,
      },
    },
    {
      $sort: { month: 1 }, // Sort by month in ascending order (1 = January, 12 = December)
    },
  ]);

  // Merge the months array with the actual data to ensure all months are included
  const fullUserRatios = months.map((monthData) => {
    const found = userRatios.find((data) => data.month === monthData.month);
    return found ? found : monthData; // Use found data or default to 0
  });

  return fullUserRatios;
};

const getUserById = async (id: string) => {
  const result = await User.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  return result;
};

const getUserByEmail = async (email: string) => {
  const result = await User.findOne({ email });

  return result;
};

const updateUser = async (id: string, payload: Partial<TUser>) => {
  const { email, password, role, ...rest } = payload;

  const user = await User.findByIdAndUpdate(id, rest, { new: true });

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User updating failed');
  }

  return user;
};

const updateOwnerStatusService = async (businessId: string) => {
  const businessOwner = await User.findById(businessId);
  if (!businessOwner) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const updateBusinessOwner = await User.findByIdAndUpdate(
    businessId,
    { isActive: !businessOwner.isActive },
    { new: true },
  );

  if (!updateBusinessOwner) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User updating failed');
  }

  return updateBusinessOwner;
};

const deleteMyAccount = async (id: string, payload: DeleteAccountPayload) => {
  const user: TUser | null = await User.IsUserExistById(id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user?.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted');
  }

  if (!(await User.isPasswordMatched(payload.password, user.password))) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password does not match');
  }

  const userDeleted = await User.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!userDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'user deleting failed');
  }

  return userDeleted;
};

const blockedUser = async (id: string) => {
  const user = await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  );

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'user deleting failed');
  }

  return user;
};

export const userService = {
  createUserToken,
  otpVerifyAndCreateUser,
  getUserById,
  getUserByEmail,
  blockedUser,
  getAllUserQuery,
  getAllUserCount,
  getAllUserRatio,
  // isBusinessExist,
  updateUser,
  updateOwnerStatusService,
  deleteMyAccount,
};
