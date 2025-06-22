import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { USER_ROLE } from '../user/user.constants';
import { User } from '../user/user.models';

// get all users
const allUser = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(
    User.find({ role: { $nin: [USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN] } }), // Exclude users with SUPER_ADMIN or ADMIN roles
    query, // Additional filters or query parameters passed in
  );

  const users = await queryBuilder
    .search(['fullName', 'email', 'address'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .modelQuery.exec();

  const meta = await queryBuilder.countTotal();

  return { users, meta };
};
// get single users
const singleUser = async (id: string) => {
  const result = await User.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found.');
  }
  return result;
};
// update  users
const updateUserStatus = async (id: string, status: string) => {
  const result = await User.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found.');
  }
  return result;
};


export const DashboardUserService = {
  allUser,
  singleUser,
  updateUserStatus
};
