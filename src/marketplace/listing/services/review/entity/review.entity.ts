import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  reviewer: mongoose.Types.ObjectId;
  reviewee: mongoose.Types.ObjectId;
  listing: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
}

export const ReviewSchema = new mongoose.Schema<IReview>({
  reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: { type: String, maxlength: 500 }
}, { timestamps: true });

ReviewSchema.index({ reviewer: 1, listing: 1 }, { unique: true });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);