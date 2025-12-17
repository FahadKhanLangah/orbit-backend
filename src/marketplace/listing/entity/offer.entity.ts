import mongoose, { Document } from "mongoose";

export enum OfferStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  COUNTERED = 'countered'
}
export interface IOffer extends Document {
  listing: mongoose.Types.ObjectId,
  buyer: mongoose.Types.ObjectId,
  seller: mongoose.Types.ObjectId,
  price: number,
  status: string,
  history: [{
  }]
}

export const OfferSchema = new mongoose.Schema<IOffer>({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  price: { type: Number, required: true },

  status: { type: String, enum: Object.values(OfferStatus), default: OfferStatus.PENDING },

  history: [{
    action: { type: String, enum: ['offer', 'counter', 'reject'] },
    price: Number,
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });