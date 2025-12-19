import mongoose, { Schema, Document, Types } from "mongoose";

export interface IListingEngagement extends Document {
  user: Types.ObjectId;
  listing: Types.ObjectId;
  isLiked: boolean;
  viewedAt: Date;
  favoritedAt?: Date;
  contactedAt?: Date;
}

export const ListingEngagementSchema = new Schema<IListingEngagement>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    isLiked: { type: Boolean, default: false },
    viewedAt: { type: Date, default: Date.now },
    favoritedAt: { type: Date },
    contactedAt: { type: Date },
  },
  {
    timestamps: true,
    collection: "listing_engagements"
  }
);
ListingEngagementSchema.index({ user: 1, listing: 1 });

export const ListingEngagementModel = mongoose.model<IListingEngagement>(
  "ListingEngagement",
  ListingEngagementSchema
);