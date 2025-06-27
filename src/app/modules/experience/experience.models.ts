import { Schema, Types, model } from 'mongoose';
import { ICertificate, IWorkHistory, WorkHistoryModel } from './experience.interface';
import { User } from '../user/user.models';

const workHistorySchema = new Schema<IWorkHistory>(
  {
    companyName: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      default: '',
    },
    endDate: {
      type: Date,
      default: '',
    },
    currentWork: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

const certificateSchema = new Schema<ICertificate>(
  {
    title: {
      type: String,
      required: false,
    },
    certificateFile: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);
// Function to update user's total experience
// Function to update user's total experience
workHistorySchema.statics.updateUserTotalExperience = async function(
  userId: string | Types.ObjectId
): Promise<number> {
  const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
  
  const matchStage = { $match: { userId: userObjectId } };
  
  const pipeline = [
    matchStage,
    {
      $addFields: {
        effectiveEndDate: {
          $cond: { if: '$currentWork', then: new Date(), else: '$endDate' }
        }
      }
    },
    {
      $addFields: {
        experienceMs: { $subtract: ['$effectiveEndDate', '$startDate'] }
      }
    },
    {
      $group: {
        _id: null,
        totalExperienceMs: { $sum: '$experienceMs' }
      }
    },
    {
      $project: {
        totalYears: {
          $round: [
            { $divide: ['$totalExperienceMs', 1000 * 60 * 60 * 24 * 365.25] },
            2
          ]
        }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  const totalExperience = result[0]?.totalYears || 0;
  
  // Update user's totalExpariance
  await User.findByIdAndUpdate(userObjectId, { totalExpariance: totalExperience });
  
  return totalExperience;
};

// Auto-update user experience after any change
workHistorySchema.post('save', async function(doc) {
  try {
    await WorkHistory.updateUserTotalExperience(doc.userId);
  } catch (error) {
    console.error('Error updating user experience:', error);
  }
});

workHistorySchema.post('findOneAndUpdate', async function(doc) {
  if (doc) {
    try {
      await WorkHistory.updateUserTotalExperience(doc.userId);
    } catch (error) {
      console.error('Error updating user experience:', error);
    }
  }
});

workHistorySchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    try {
      await WorkHistory.updateUserTotalExperience(doc.userId);
    } catch (error) {
      console.error('Error updating user experience:', error);
    }
  }
});

export const WorkHistory = model<IWorkHistory, WorkHistoryModel>(
  'WorkHistory',
  workHistorySchema,
);
export const Certificate = model<ICertificate>(
  'Certificate',
  certificateSchema,
);
