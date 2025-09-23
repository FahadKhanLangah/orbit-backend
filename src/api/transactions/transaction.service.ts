import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose'; // Import ClientSession and Types
import { ITransaction, TransactionType } from './schemas/transaction.schema';

// This is the new input interface.
// Notice it only asks for the percentage, not the calculated details.
export interface CreateTransactionInput {
  userId: Types.ObjectId | string;
  amount: number;
  type: TransactionType;
  description: string;
  commissionPercentage: number; // The service will calculate the rest
  metadata?: Record<string, any>;
}

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel('Transaction') private readonly transactionModel: Model<ITransaction>,
  ) {}

  /**
   * Creates a new transaction record within an existing database session.
   * This is now "smarter" as it calculates commission details internally.
   * @param params - The details of the transaction.
   * @param session - The Mongoose session to ensure atomicity.
   */
  async create(
    params: CreateTransactionInput,
    session?: ClientSession, // Accept the session here
  ): Promise<ITransaction> {
    const { amount, commissionPercentage, ...rest } = params;

    // --- Centralized Calculation Logic ---
    const systemShare = amount * (commissionPercentage / 100);
    const netAmount = amount - systemShare;

    // Build the full data object that matches the schema
    const transactionData = {
      ...rest,
      amount,
      metadata: params.metadata || {},
      commissionDetails: {
        percentage: commissionPercentage,
        systemShare: systemShare,
        netAmount: netAmount,
      },
    };

    const transaction = new this.transactionModel(transactionData);
    
    // Pass the session to the save() method to make it part of the transaction
    return transaction.save({ session });
  }
}