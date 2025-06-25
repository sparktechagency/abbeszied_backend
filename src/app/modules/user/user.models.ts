import { Error, Schema, model } from 'mongoose';
import config from '../../config';
import bcrypt from 'bcrypt';
import { TUser, UserModel } from './user.interface';
import { Role, USER_ROLE } from './user.constants';
import { Aggregate } from 'mongoose';

const userSchema = new Schema<TUser>(
  {
    image: {
      type: String,
      default: '',
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: Role,
      default: USER_ROLE.CLIENT,
    },
    address: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    introVideo: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    totalEarning: {
      type: Number,
      default: 0,
    },
    totalSpend: {
      type: Number,
      default: 0,
    },
    jobPostCount: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      default: undefined,
    },
    traningVanue: {
      type: [String],
      default: undefined,
    },
    interests: {
      type: [String],
      default: undefined,
    },
    stripeConnectedAcount: {
      type: String,
      default: '',
    },
    stripeCustomerId: {
      type: String,
      default: '',
    },
    overview: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    verifiedByAdmin: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verifiedBadge: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);
userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  },
});
userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds),
  );
  next();
});
// Mongoose middleware to set `verifiedByAdmin` based on the role when a document is created
userSchema.pre('save', function (next) {
  if (this.isNew) {
    // If it's a new document
    if (this.role === USER_ROLE.COACH) {
      this.verifiedByAdmin = 'pending';
    } else {
      this.verifiedByAdmin = 'verified';
    }
  }
  next();
});
// set '' after saving password
userSchema.post(
  'save',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function (error: Error, doc: any, next: (error?: Error) => void): void {
    doc.password = '';
    next();
  },
);

// filter out deleted documents
userSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});
userSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});
userSchema.pre('aggregate', function (this: Aggregate<any>, next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});
userSchema.statics.isUserExist = async function (email: string) {
  return await User.findOne({ email: email }).select('+password');
};
userSchema.statics.isUserActive = async function (email: string) {
  return await User.findOne({
    email: email,
    isDeleted: false,
    isActive: true,
  }).select('+password');
};
userSchema.statics.IsUserExistById = async function (id: string) {
  return await User.findById(id).select('+password');
};
userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

export const User = model<TUser, UserModel>('User', userSchema);
