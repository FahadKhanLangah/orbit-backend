import mongoose, { Document, Schema } from 'mongoose';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal'
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed'
}

export interface IPaystackTransaction extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  reference: string;
  recipientCode?: string;
  createdAt: Date;
}

export const PaystackTransactionSchema = new Schema<IPaystackTransaction>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: Object.values(TransactionType), required: true },
  status: { type: String, enum: Object.values(TransactionStatus), default: TransactionStatus.PENDING },
  reference: { type: String, unique: true, required: true },
  recipientCode: { type: String }
}, { timestamps: true });

export const Transaction = mongoose.model<IPaystackTransaction>('PaystackTransaction', PaystackTransactionSchema);