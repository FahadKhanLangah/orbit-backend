import mongoose, { Document } from 'mongoose';

export enum ListingStatus {
  DRAFT = "draft",
  ACTIVE = "active"
}

export interface IListing extends Document {
  title: string;
  description?: string;
  price?: number;
  image: string[];
  category: string;
  brand: string;
  video?: string;
  condition: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  impressions: {
    inDays: number;
    totalImpressions: number;
  };
  status: string;
  expiry?: Date;
  postBy: mongoose.Types.ObjectId;
  hide: boolean;
}

export const ListingSchema = new mongoose.Schema<IListing>({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number },
  image: [{ type: String }], // keys or urls
  category: { type: String, required: true },
  brand: { type: String },
  video: { type: String },
  condition: { type: String, required: true },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String },
  },
  impressions: {
    inDays: { type: Number, default: 0 },
    totalImpressions: { type: Number, default: 0 },
  },
  status: { type: String, default: ListingStatus.DRAFT, enum: ListingStatus },
  expiry: { type: Date },
  postBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hide: { type: Boolean, default: false },
}, { timestamps: true });

export const Listing = mongoose.model<IListing>('Listing', ListingSchema);
