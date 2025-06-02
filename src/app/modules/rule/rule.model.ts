import mongoose, { Schema } from 'mongoose';
import { IRule } from './rule.interface';
import { User } from '../user/user.models';

const ruleSchema: Schema = new Schema<IRule>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    text: {
      type: String,
      required: [true, 'Text is required'],
    },
    status: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Rule = mongoose.model<IRule>('Rule', ruleSchema);
export default Rule;
