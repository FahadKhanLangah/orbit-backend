import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ClientSession, Types } from "mongoose"; // Import ClientSession and Types
import { ITransaction, TransactionType } from "./schemas/transaction.schema";

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
    @InjectModel("Transaction")
    private readonly transactionModel: Model<ITransaction>
  ) {}

  /**
   * Creates a new transaction record within an existing database session.
   * This is now "smarter" as it calculates commission details internally.
   * @param params - The details of the transaction.
   * @param session - The Mongoose session to ensure atomicity.
   */
  async create(
    params: CreateTransactionInput,
    session?: ClientSession
  ): Promise<ITransaction> {
    const { amount, commissionPercentage, ...rest } = params;
    const systemShare = amount * (commissionPercentage / 100);
    const netAmount = amount - systemShare;

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
    return transaction.save({ session });
  }

  async getTotalSystemShare(): Promise<number> {
    const result = await this.transactionModel.aggregate([
      {
        $group: {
          _id: null,
          totalShare: { $sum: "$commissionDetails.systemShare" },
        },
      },
    ]);

    if (result.length > 0) {
      return result[0].totalShare;
    }

    return 0;
  }
}
