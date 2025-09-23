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
  userId: Types.ObjectId; // The user who initiated the transaction (paid)
  amount: number; // The gross amount deducted from the user's balance
  type: TransactionType; // The category of the transaction
  description: string; // A human-readable summary
  metadata: Record<string, any>; // Flexible field for context-specific data
  commissionDetails: {
    percentage: number;
    systemShare: number;
    netAmount: number; // Amount the recipient gets
  };
}

export const TransactionSchema: Schema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: Object.values(TransactionType), required: true, index: true },
    description: { type: String, required: true },
    // Metadata stores data unique to each transaction type
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