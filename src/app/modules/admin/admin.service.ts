import httpStatus from "http-status";
import AppError from "../../error/AppError";
import { USER_ROLE } from "../user/user.constants";
import { User } from "../user/user.models";
import { TUser } from "../user/user.interface";


const createAdminToDB = async (payload: Partial<TUser>): Promise<TUser> => {
     payload.role = USER_ROLE.ADMIN;
     payload.isActive = true;
     payload.status = 'active';
     const createAdmin: any = await User.create(payload);
     if (!createAdmin) {
          throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create Admin');
     }
     return createAdmin;
};

const deleteAdminFromDB = async (id: any): Promise<TUser | undefined> => {
     const isExistAdmin = await User.findByIdAndDelete(id);
     if (!isExistAdmin) {
          throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete Admin');
     }
     return;
};

const getAdminsFromDB = async (): Promise<TUser[]> => {
     const admins = await User.find({ role: USER_ROLE.ADMIN }).select(
          'fullName email phone image role createdAt',
     );
     return admins;
};
const getAdminFromDB = async (): Promise<TUser[]> => {
     const admins = await User.find({ role: USER_ROLE.SUPER_ADMIN }).select(
          'fullName email phone image role createdAt',
     );
     return admins;
};

export const AdminService = {
     createAdminToDB,
     deleteAdminFromDB,
     getAdminFromDB,
     getAdminsFromDB
};
