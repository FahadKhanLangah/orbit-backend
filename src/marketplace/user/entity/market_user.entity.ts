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
  savedListings: []
}
export const marketUserSchema = new mongoose.Schema<IMarketUser>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: Object.values(MarketUserRole), default: MarketUserRole.buyer },
    bio: { type: String, default: null },
    trustBadge: { type: Boolean, default: false },
    savedListings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }]
  }
)

export const MarketUser = mongoose.model<IMarketUser>(
  "MarketUser",
  marketUserSchema
);