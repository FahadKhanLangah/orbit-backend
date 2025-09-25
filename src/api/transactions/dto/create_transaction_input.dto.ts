import { Types } from "mongoose";
import { TransactionType } from "../schemas/transaction.schema";

export interface CreateTransactionInput {
  userId: Types.ObjectId | string;
  amount: number;
  type: TransactionType;
  description: string;
  commissionPercentage: number; // The service will calculate the rest
  metadata?: Record<string, any>;
}