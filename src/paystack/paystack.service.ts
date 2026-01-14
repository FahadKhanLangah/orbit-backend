import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser } from 'src/api/user_modules/user/entities/user.entity';
import { IPaystackTransaction, TransactionStatus, TransactionType } from 'src/wallet/entity/transaction.entity';


@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private readonly PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY; // sk_test_...
  private readonly BASE_URL = 'https://api.paystack.co';

  constructor(
    @InjectModel('PaystackTransaction') private transactionModel: Model<IPaystackTransaction>,
    @InjectModel('User') private userModel: Model<IUser>,
  ) {}

  // 1. TOP-UP (DEPOSIT) LOGIC
  async initializeTopUp(userId: string, email: string, amount: number) {
    // Paystack expects amount in Kobo/Cents (x100)
    const amountInKobo = amount * 100;
    
    try {
      const response = await axios.post(
        `${this.BASE_URL}/transaction/initialize`,
        {
          email,
          amount: amountInKobo,
          currency: 'KES', // Kenya Shillings
          callback_url: 'https://orbit.ke/wallet',
          metadata: { userId } 
        },
        { headers: { Authorization: `Bearer ${this.PAYSTACK_SECRET}` } }
      );

      await this.transactionModel.create({
        user: userId,
        amount,
        type: TransactionType.DEPOSIT,
        reference: response.data.data.reference,
        status: TransactionStatus.PENDING
      });

      return response.data.data; // Contains authorization_url
    } catch (error) {
      this.logger.error(error.response?.data || error.message);
      throw new BadRequestException('Payment initialization failed');
    }
  }

  // 2. WITHDRAWAL LOGIC
  // Step A: Create a Transfer Recipient (Bank/Mobile Money details)
  async createRecipient(name: string, accountNumber: string, bankCode: string) {
    // bank_code for M-Pesa is usually specific, often use 'MPS' for Paystack mobile money
    try {
      const response = await axios.post(
        `${this.BASE_URL}/transferrecipient`,
        {
          type: 'mobile_money', // Or 'nuban' for bank accounts
          name,
          account_number: accountNumber,
          bank_code: bankCode, 
          currency: 'KES'
        },
        { headers: { Authorization: `Bearer ${this.PAYSTACK_SECRET}` } }
      );
      return response.data.data.recipient_code;
    } catch (error) {
      throw new BadRequestException('Invalid account details');
    }
  }

  // Step B: Initiate Transfer
  async withdrawFunds(userId: string, amount: number, recipientCode: string) {
    const session = await this.userModel.db.startSession();
    session.startTransaction();

    try {
      const user = await this.userModel.findOne({ userId }).session(session);

      if (user.balance < amount) {
        throw new BadRequestException('Insufficient funds');
      }

      // 1. Deduct Balance IMMEDIATELY (Prevent double withdraw)
      user.balance -= amount;
      await user.save({ session });

      // 2. Initiate Transfer with Paystack
      const response = await axios.post(
        `${this.BASE_URL}/transfer`,
        {
          source: 'balance',
          amount: amount * 100, // In cents
          recipient: recipientCode,
          reason: 'Wallet Withdrawal'
        },
        { headers: { Authorization: `Bearer ${this.PAYSTACK_SECRET}` } }
      );

      // 3. Log Transaction
      await this.transactionModel.create([{
        user: userId,
        amount,
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.PENDING, // Wait for webhook to confirm success
        reference: response.data.data.reference,
        recipientCode
      }], { session });

      await session.commitTransaction();
      return { message: 'Withdrawal processing', reference: response.data.data.reference };

    } catch (error) {
      await session.abortTransaction();
      this.logger.error(error);
      throw new BadRequestException(error.response?.data?.message || 'Withdrawal failed');
    } finally {
      session.endSession();
    }
  }

  // ==========================================
  // 3. WEBHOOK HANDLER (CRITICAL)
  // ==========================================
  
  async handleWebhook(event: any) {
    const { event: type, data } = event;

    if (type === 'charge.success') {
      // Handle Successful Deposit
      await this.confirmDeposit(data.reference, data.metadata.userId, data.amount / 100);
    } else if (type === 'transfer.success') {
      // Handle Successful Withdrawal
      await this.updateTransactionStatus(data.reference, TransactionStatus.SUCCESS);
    } else if (type === 'transfer.failed' || type === 'transfer.reversed') {
      // Handle Failed Withdrawal (Refund User)
      await this.refundFailedWithdrawal(data.reference);
    }
  }

  // Helper: Confirm Deposit
  private async confirmDeposit(reference: string, userId: string, amount: number) {
    const transaction = await this.transactionModel.findOne({ reference });
    
    // Idempotency check: Don't process if already successful
    if (!transaction || transaction.status === TransactionStatus.SUCCESS) return;

    const session = await this.userModel.db.startSession();
    session.startTransaction();

    try {
      // 1. Update Transaction
      transaction.status = TransactionStatus.SUCCESS;
      await transaction.save({ session });

      // 2. Credit User Balance
      await this.userModel.findOneAndUpdate(
        { userId },
        { $inc: { balance: amount } }
      ).session(session);

      await session.commitTransaction();
      this.logger.log(`Deposit confirmed: ${amount} for user ${userId}`);
    } catch (e) {
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  }

  // Helper: Refund Failed Withdrawal
  private async refundFailedWithdrawal(reference: string) {
    const transaction = await this.transactionModel.findOne({ reference });
    if (!transaction || transaction.status !== TransactionStatus.PENDING) return;

    const session = await this.userModel.db.startSession();
    session.startTransaction();

    try {
      // 1. Mark Transaction Failed
      transaction.status = TransactionStatus.FAILED;
      await transaction.save({ session });

      // 2. Refund User
      await this.userModel.findOneAndUpdate(
        { userId: transaction.user },
        { $inc: { balance: transaction.amount } } // Add money back
      ).session(session);

      await session.commitTransaction();
    } catch (e) {
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  }
  
  private async updateTransactionStatus(reference: string, status: TransactionStatus) {
      await this.transactionModel.updateOne({ reference }, { status });
  }
}