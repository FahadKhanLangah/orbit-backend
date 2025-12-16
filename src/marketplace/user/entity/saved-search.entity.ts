import mongoose, { Document, Schema } from 'mongoose';

export interface ISavedSearch extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  criteria: {
    query?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
  };
  alerts: boolean;
}

export const SavedSearchSchema = new mongoose.Schema<ISavedSearch>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  criteria: {
    query: { type: String },
    category: { type: String },
    minPrice: { type: Number },
    maxPrice: { type: Number },
    location: { type: String },
  },
  alerts: { type: Boolean, default: true },
}, { timestamps: true });

export const SavedSearch = mongoose.model<ISavedSearch>('SavedSearch', SavedSearchSchema);