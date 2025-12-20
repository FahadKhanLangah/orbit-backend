import mongoose, { Document, Schema } from "mongoose";
export enum MarketUserRole {
  seller = "seller",
  buyer = "buyer"
}


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
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }
)

export const MarketUser = mongoose.model<IMarketUser>(
  "MarketUser",
  marketUserSchema
);