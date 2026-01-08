import mongoose, { Document, Schema } from "mongoose";
import { BadgeType, MarketUserRole } from "../enums/market.enums";


export interface IMarketUser extends Document {
  _id: string;
  userId: mongoose.Schema.Types.ObjectId;
  role: MarketUserRole;
  bio: string;
  trustBadge: Boolean,
  savedListings: [],
  rating: {
    average: number;
    count: number;
  };
  blockedUsers: mongoose.Types.ObjectId[];
  badges: BadgeType[];
  salesCount: number;
  breederLicense: {
    licenseNumber?: string,
    documentImage?: string,
    status?: string,
    submittedAt?: Date
  },
  isBanned: boolean;
  banReason?: string;
  warnings: {
    reason: string;
    date: Date;
    adminId?: string;
  }[];
}
export const marketUserSchema = new mongoose.Schema<IMarketUser>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: Object.values(MarketUserRole), default: MarketUserRole.buyer },
    bio: { type: String, default: null },
    trustBadge: { type: Boolean, default: false },
    savedListings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    badges: [{ type: String, enum: Object.values(BadgeType) }],
    salesCount: { type: Number, default: 0 },
    breederLicense: {
      licenseNumber: { type: String },
      documentImage: { type: String },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      submittedAt: { type: Date }
    },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String },
    warnings: [{
      reason: { type: String },
      date: { type: Date, default: Date.now }
    }]
  }
)

export const MarketUser = mongoose.model<IMarketUser>(
  "MarketUser",
  marketUserSchema
);