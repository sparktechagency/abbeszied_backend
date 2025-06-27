import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { Certificate } from '../experience/experience.models';
import { User } from '../user/user.models';
import mongoose from 'mongoose';

const getAllCertificates = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(
    Certificate.find({ verified: false }).populate(
      'userId',
      'fullName email verifiedByAdmin image phone',
    ),
    query,
  );
  const result = await queryBuilder
    .fields()
    .filter()
    .paginate()
    .search(['title', 'description'])
    .sort()
    .modelQuery.exec();
  const meta = await queryBuilder.countTotal();

  return {
    result,
    meta,
  };
};
const getSingleCertificate = async (id: string) => {
  const result = await Certificate.findById(id).populate(
    'userId',
    'fullName email verifiedByAdmin image phone',
  );
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Certificate not found');
  }
  return result;
};

const updateStatus = async (id: string, status: string) => {
  const session = await mongoose.startSession(); // Start a session
  session.startTransaction(); // Start the transaction

  try {
    // Fetch the certificate by ID within the session
    const certificate = await Certificate.findById(id).session(session);
    if (!certificate) {
      throw new AppError(httpStatus.NOT_FOUND, 'Certificate not found');
    }

    // Update the user's verifiedByAdmin status within the session
    const updatedUser = await User.findByIdAndUpdate(
      certificate.userId,
      { verifiedByAdmin: status },
      { new: true, session }, // Use session for the update
    );
    if (!updatedUser) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Update all certificates associated with the user within the session
    const updateResult = await Certificate.updateMany(
      { userId: certificate.userId },
      { $set: { verified: true } },
      { session }, // Use session for the update
    );

    // Check if any certificates were actually updated
    if (updateResult.modifiedCount === 0) {
      throw new AppError(httpStatus.NOT_FOUND, 'No certificates were updated');
    }

    // Commit the transaction after successful updates
    await session.commitTransaction();

    // Return success message along with updated user and certificate result
    return {
      message: 'Status updated successfully',
      updatedUser,
      updateResult,
    };
  } catch (error) {
    // Rollback the transaction if any error occurs
    await session.abortTransaction();
    console.error('Error during status update transaction:', error);
    throw error; // Re-throw the error for further handling
  } finally {
    // End the session regardless of success or failure
    session.endSession();
  }
};

export const CertificateManagmentsService = {
  getAllCertificates,
  getSingleCertificate,
  updateStatus,
  //   getSingleCertificate,
  //   deleteCertificate,
  //   deleteMultipleCertificates,
  //   changeCertificateStatus,
};
