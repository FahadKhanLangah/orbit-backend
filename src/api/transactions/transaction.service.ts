import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { ITransaction, TransactionType } from './schemas/transaction.schema';


interface CreateTransactionParams {
  userId: string;
  amount: number;
  type: TransactionType;
  description: string;
  metadata?: Record<string, any>;
  commissionDetails: {
    percentage: number;
    systemShare: number;
    netAmount: number;
  };
}

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel('Transaction') private readonly transactionModel: Model<ITransaction>,
  ) {}

  /**
   * Creates a new transaction record within an existing database session.
   * This ensures that logging the transaction is part of an atomic operation.
   * @param params - The details of the transaction.
   */
  async create(params: CreateTransactionParams): Promise<ITransaction> {
    const transaction = new this.transactionModel(params);
    return transaction.save();
  }
}