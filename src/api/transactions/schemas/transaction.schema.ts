import { Schema, Document, Types } from 'mongoose';

// Define the types of transactions your system will handle
export enum TransactionType {
  GIFT_SENT = 'GIFT_SENT',
  VIDEO_PURCHASE = 'VIDEO_PURCHASE',
  SUBSCRIPTION_FEE = 'SUBSCRIPTION_FEE',
  BALANCE_TOPUP = 'BALANCE_TOPUP',
}

// This interface defines the structure of a transaction document
export interface ITransaction extends Document {
  userId: Types.ObjectId;
  amount: number; 
  type: TransactionType; 
  description: string; 
  metadata: Record<string, any>;
  commissionDetails: {
    percentage: number;
    systemShare: number;
    netAmount: number;
  };
}

export const TransactionSchema: Schema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: Object.values(TransactionType), required: true, index: true },
    description: { type: String, required: true },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    commissionDetails: {
      percentage: { type: Number, required: true },
      systemShare: { type: Number, required: true },
      netAmount: { type: Number, required: true },
    },
  },
  {
    timestamps: true,
  },
);