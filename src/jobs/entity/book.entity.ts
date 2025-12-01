import * as mongoose from 'mongoose';

export interface IBook extends mongoose.Document {
  author: string;
  title: string;
  coverImage?: string;
  price: number;
  isForSale: boolean;
  previewText: string;
  fullContent: string;
  purchasedBy: string[];
  likes: string[];
  views: number;
}


export const BookSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  coverImage: { type: String, default: null },
  price: { type: Number, default: 0 },
  isForSale: { type: Boolean, default: false },
  previewText: { type: String, required: true },
  fullContent: { type: String, required: true },
  purchasedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
}, { timestamps: true });