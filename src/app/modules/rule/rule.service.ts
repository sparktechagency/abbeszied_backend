import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import { IRule } from './rule.interface';
import Rule from './rule.model';
import QueryBuilder from '../../builder/QueryBuilder';
import mongoose from 'mongoose';
import { User } from '../user/user.models';

const createRuleService = async (payload: IRule) => {
  const user = await User.IsUserExistById(payload?.ownerId.toString());

  if (user.role != 'business') {
    throw new AppError(httpStatus.BAD_REQUEST, 'User are not authorized!');
  }

  const result = await Rule.create(payload);
  return result;
};

const getAllRuleByOwnerIdService = async (
  ownerId: string,
  query: Record<string, unknown>,
) => {
  // console.log('query aaaaaaaa');
  // console.log(query);
  const ruleQuery = new QueryBuilder(
    Rule.find({ ownerId, isDeleted: false }),
    query,
  )
    .filter()
    .sort()
    .paginate();

  const result = await ruleQuery.modelQuery;

  const meta = await ruleQuery.countTotal();

  return { meta, result };
};

const updateRuleService = async (
  ruleId: string,
  ownerId: string,
  payload: {
    text?: string;
    status?: boolean;
  },
) => {
  const user = await User.IsUserExistById(ownerId.toString());

  if (user.role != 'business') {
    throw new AppError(httpStatus.BAD_REQUEST, 'User are not authorized!');
  }

  const rule = await Rule.findOne({
    _id: new mongoose.Types.ObjectId(ruleId),
    ownerId,
  });

  // console.log({ ruleId });
  if (!rule) {
    throw new AppError(httpStatus.NOT_FOUND, 'Not found !!');
  }

  let result = undefined;

  if (payload.status) {
    result = await Rule.findByIdAndUpdate(
      ruleId,
      {
        status: !rule.status,
      },
      { new: true },
    );
  } else {
    result = await Rule.findByIdAndUpdate(ruleId, payload, { new: true });
  }

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update  rule!!');
  }
  return result;
};

const deleteRuleService = async (ruleId: string, ownerId: string) => {
  const user = await User.IsUserExistById(ownerId.toString());

  if (user.role != 'business') {
    throw new AppError(httpStatus.BAD_REQUEST, 'User are not authorized!');
  }

  const rule = await Rule.findOne({
    _id: new mongoose.Types.ObjectId(ruleId),
    ownerId: ownerId,
  });

  if (!rule) {
    throw new AppError(httpStatus.NOT_FOUND, 'Not found this  rule');
  }

  const result = await Rule.findByIdAndUpdate(
    ruleId,
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update rule!!');
  }
  return result;
};

export const ruleServices = {
  createRuleService,
  getAllRuleByOwnerIdService,
  updateRuleService,
  deleteRuleService,
};
