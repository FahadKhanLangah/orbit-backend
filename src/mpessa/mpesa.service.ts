import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { getMpesaAccessToken } from './utils/token.util';
import { MpesaTransaction, MpesaTransactionDocument, MpesaTransactionStatus, MpesaTransactionType } from './schemas/mpesa.schema';
import { Commission, CommissionDocument } from './schemas/commission.schema';
import { StkPushResponse } from './interfaces/mpesa.interface';
import { IUser } from 'src/api/user_modules/user/entities/user.entity';

@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);
  private readonly baseUrl: string;
  private readonly shortcode: string;
  private readonly passkey: string;
  private readonly callbackUrl: string;

  constructor(
    @InjectModel(MpesaTransaction.name)
    private readonly mpesaModel: Model<MpesaTransactionDocument>,
    @InjectModel('User') private readonly userModel: Model<IUser>,

    @InjectModel(Commission.name)
    private readonly commissionModel: Model<CommissionDocument>,
  ) {
    const env = process.env.MPESA_ENVIRONMENT || 'sandbox';
    this.baseUrl =
      env === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';

    this.shortcode = process.env.MPESA_SHORTCODE;
    this.passkey = process.env.MPESA_PASSKEY;
    this.callbackUrl = process.env.MPESA_CALLBACK_URL;
  }

  private async getAccessToken(): Promise<string> {
    return getMpesaAccessToken();
  }

  async initiateStkPush(data): Promise<StkPushResponse> {
    try {
      const token = await this.getAccessToken();
      this.logger.log('Access Token:', token);
      const timestamp = this.getTimestamp();
      const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');

      const requestPayload = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: data.amount,
        PartyA: data.phone,
        PartyB: this.shortcode,
        PhoneNumber: data.phone,
        CallBackURL: data.callbackUrl || this.callbackUrl,
        AccountReference: data.accountReference,
        TransactionDesc: data.transactionDesc || 'Payment',
      };

      const response = await axios.post<StkPushResponse>(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        requestPayload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Save initial transaction
      await this.mpesaModel.create({
        userId: data.userId,
        transactionType: MpesaTransactionType.STK_PUSH,
        status: MpesaTransactionStatus.Pending,
        amount: data.amount,
        phone: data.phone,
        MerchantRequestID: response.data.MerchantRequestID,
        CheckoutRequestID: response.data.CheckoutRequestID,
      });

      return response.data;
    } catch (error) {
      this.logger.error('STK Push Error:', error?.response?.data || error.message);
      throw new Error('Failed to initiate STK Push');
    }
  }

  async handleCallback(callbackData: any): Promise<void> {
    this.logger.log('--- M-Pesa Callback Received ---');
    this.logger.log(JSON.stringify(callbackData, null, 2));

    try {
      const body = callbackData?.Body?.stkCallback;
      if (!body) {
        this.logger.warn('Invalid callback format');
        return;
      }

      const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } = body;

      // 1. Find the transaction in our database
      const transaction = await this.mpesaModel.findOne({ MerchantRequestID, CheckoutRequestID });

      if (!transaction) {
        this.logger.error(`Transaction not found for MerchantRequestID: ${MerchantRequestID}`);
        return;
      }

      // 2. CRITICAL: Prevent processing the same transaction twice
      if (transaction.status === MpesaTransactionStatus.Completed) {
        this.logger.warn(`Transaction ${MerchantRequestID} already completed. Ignoring.`);
        return;
      }

      // 3. If the transaction failed on M-Pesa's side
      if (ResultCode !== 0) {
        await transaction.updateOne({
          status: MpesaTransactionStatus.Failed,
          resultCode: ResultCode,
          resultDesc: ResultDesc,
          callbackData: body,
        });
        this.logger.error(`STK Push failed for user ${transaction.userId}. Reason: ${ResultDesc}`);
        return; // Stop processing
      }

      // 4. --- THIS IS THE MISSING LOGIC ---
      // If the transaction was successful (ResultCode is 0)
      const meta = body.CallbackMetadata?.Item || [];
      const amount = meta.find((x) => x.Name === 'Amount')?.Value || 0;
      const mpesaReceiptNumber = meta.find((x) => x.Name === 'MpesaReceiptNumber')?.Value || '';

      // <-- START: ADD THIS BLOCK
      // Atomically add the amount to the user's balance.
      await this.userModel.updateOne(
        { _id: transaction.userId },
        { $inc: { balance: amount } }
      );
      // <-- END: ADD THIS BLOCK

      // 5. Now, update our transaction log to show it's complete
      await transaction.updateOne({
        status: MpesaTransactionStatus.Completed, // <-- Mark as completed
        amount,
        mpesaReceiptNumber,
        resultCode: ResultCode,
        resultDesc: "The transaction was successful.",
        callbackData: body,
      });

      this.logger.log(`SUCCESS: User ${transaction.userId} credited with ${amount}.`);

    } catch (err) {
      this.logger.error('Callback handling failed critically:', err.message);
      // We catch the error to prevent the app from crashing and sending a 500
    }
  }

  async calculateCommission(totalAmount: number): Promise<{ commission: number; netAmount: number }> {
    const config = await this.commissionModel.findOne({ isActive: true });
    const rate = config?.percentage || 10;
    const commission = (totalAmount * rate) / 100;
    const netAmount = totalAmount - commission;
    return { commission, netAmount };
  }

  private getTimestamp(): string {
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const DD = String(now.getDate()).padStart(2, '0');
    const HH = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${YYYY}${MM}${DD}${HH}${mm}${ss}`;
  }
}
