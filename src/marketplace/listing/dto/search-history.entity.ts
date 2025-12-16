import mongoose, { Document } from 'mongoose';

export interface ISearchHistory extends Document {
  user: mongoose.Types.ObjectId;
  searchQuery: string;
  filters: Record<string, any>;
  lastSearched: Date;
}

export const SearchHistorySchema = new mongoose.Schema<ISearchHistory>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  searchQuery: { type: String },
  filters: { type: Object },
  lastSearched: { type: Date, default: Date.now, expires: '30d' }
}, { timestamps: true });
SearchHistorySchema.index({ user: 1, lastSearched: -1 });

export const SearchHistory = mongoose.model<ISearchHistory>('SearchHistory', SearchHistorySchema);