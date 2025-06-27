import { Aggregate, model, Schema } from 'mongoose';
import { IProduct } from './store.interface';

// Item Schema Definition
const productsSchema = new Schema<IProduct>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    condition: {
      type: String,
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
    images: { type: [String], required: true },
    status: {
      type: String,
      enum: ['available', 'sold'],
      default: 'available',
    },
    isApproved: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'pending',
    },
  },

  {
    timestamps: true,
  },
);

// Query Middleware
productsSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

productsSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

productsSchema.pre('aggregate', function (this: Aggregate<any>, next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

const Product = model<IProduct>('Product', productsSchema);

export default Product;
