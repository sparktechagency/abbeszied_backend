import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { ISupport } from './support.interface';
import Support from './support.model';


const upsertSupport = async (data: Partial<ISupport>): Promise<ISupport> => {
     const existingSupport = await Support.findOne({});
     if (existingSupport) {
          const updatedSupport = await Support.findOneAndUpdate({}, data, {
               new: true,
          });
          return updatedSupport!;
     } else {
          const newSupport = await Support.create(data);
          if (!newSupport) {
               throw new AppError(httpStatus.BAD_REQUEST, 'Failed to add Support');
          }
          return newSupport;
     }
};

const getSupport = async () => {
     const support = await Support.findOne();

     if (!support) {
          ('');
     }
     return support;
};

export const SupportService = {
     upsertSupport,
     getSupport,
};
