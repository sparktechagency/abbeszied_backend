// ============= GALLERY.INTERFACE.TS =============
import { Document, model, Schema, Types } from 'mongoose';

// Image interface for subdocuments
export interface IImage {
  _id?: Types.ObjectId;
  url: string;
  uploadedAt?: Date;
}

// Main Gallery interface
export interface IGallery extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  images: IImage[];
  createdAt?: Date;
  updatedAt?: Date;
}


// Image subdocument schema
const imageSubSchema = new Schema<IImage>({
  url: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  }
}, { 
  _id: true // Ensures each subdocument gets an _id automatically
});

// Main Gallery schema
const gallerySchema = new Schema<IGallery>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    images: {
      type: [imageSubSchema],
      required: true,
      default: []
    },
  },
  {
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Create indexes for better performance
gallerySchema.index({ userId: 1, createdAt: -1 });
gallerySchema.index({ "images._id": 1 });

// Export the model
export const Gallery = model<IGallery>('Gallery', gallerySchema);