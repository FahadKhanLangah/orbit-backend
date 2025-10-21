import { Schema } from "mongoose";

export interface IWallet {
  _id: string;
  ownerId: string;
  ownerType: 'user' | 'driver';
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export const WalletSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, required: true },
  ownerType: { type: String, enum: ['user', 'driver'], required: true },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
}, { timestamps: true });
