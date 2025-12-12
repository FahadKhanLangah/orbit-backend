import mongoose, { Document } from 'mongoose';

export enum ListingStatus {
  DRAFT = "draft",
  ACTIVE = "active"
}
export enum PricingStructure {
  FIXED = "fixed",
  NEGOTIABLE = "negotiable"
}

export interface IListing extends Document {
  title: string;
  description?: string;
  price?: number;
  pricing?: string;
  image: string[];
  category: string;
  brand: string;
  video?: string;
  condition: string;
  location?: {};
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
  pricing: { type: String, default: PricingStructure.FIXED, enum: PricingStructure },
  image: [{ type: String }], // keys or urls
  category: { type: String, required: true },
  brand: { type: String },
  video: { type: String },
  condition: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number],  // [lng, lat]
      index: '2dsphere'
    },
    address: { type: String }
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

ListingSchema.index({
  title: "text",
  description: "text",
  category: "text",
  brand: "text"
});


export const Listing = mongoose.model<IListing>('Listing', ListingSchema);
