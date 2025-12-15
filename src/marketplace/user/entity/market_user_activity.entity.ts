import mongoose from "mongoose";

export enum UserListingAction {
  VIEW = "view",
  SAVE = "save",
  CONTACT = "contact"
}

export interface IMarketUserActivity extends Document {
  userId: mongoose.Schema.Types.ObjectId,
  listingId: mongoose.Schema.Types.ObjectId,
  action: string,
  category: string
}

export const MarketUserActivitySchema = new mongoose.Schema<IMarketUserActivity>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  action: { type: String, required: true },
  category: { type: String },
}, { timestamps: true });




export const Listing = mongoose.model<IMarketUserActivity>('MarketUserActivity', MarketUserActivitySchema);
