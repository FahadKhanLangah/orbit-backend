import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { getMpesaAccessToken } from './utils/token.util';
import { MpesaTransaction, MpesaTransactionDocument, MpesaTransactionStatus, MpesaTransactionType } from './schemas/mpesa.schema';
import { Commission, CommissionDocument } from './schemas/commission.schema';
import { StkPushRequest, StkPushResponse } from './interfaces/mpesa.interface';

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

  // ----------------------------------------
  // 🔐 1. Get Access Token (via token.util.ts)
  // ----------------------------------------
  private async getAccessToken(): Promise<string> {
    return getMpesaAccessToken();
  }

  // ----------------------------------------
  // 💳 2. STK Push (Customer → Business)
  // ----------------------------------------
  async initiateStkPush(data: StkPushRequest): Promise<StkPushResponse> {
    try {
      const token = await this.getAccessToken();
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

  // ----------------------------------------
  // 📞 3. Handle Callback
  // ----------------------------------------
  async handleCallback(callbackData: any): Promise<void> {
    try {
      const body = callbackData?.Body?.stkCallback;
      if (!body) {
        this.logger.warn('Invalid callback format');
        return;
      }

      const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } = body;
      const meta = body.CallbackMetadata?.Item || [];

      const amount = meta.find((x) => x.Name === 'Amount')?.Value || 0;
      const mpesaReceiptNumber = meta.find((x) => x.Name === 'MpesaReceiptNumber')?.Value || '';
      const phone = meta.find((x) => x.Name === 'PhoneNumber')?.Value || '';

      await this.mpesaModel.findOneAndUpdate(
        { MerchantRequestID, CheckoutRequestID },
        {
          status:
            ResultCode === 0
              ? MpesaTransactionStatus.Completed
              : MpesaTransactionStatus.Failed,
          amount,
          mpesaReceiptNumber,
          resultCode: ResultCode,
          resultDesc: ResultDesc,
          callbackData,
        },
      );

      this.logger.log(`Callback processed for CheckoutRequestID: ${CheckoutRequestID}`);
    } catch (err) {
      this.logger.error('Callback handling failed:', err.message);
      throw err;
    }
  }

  // ----------------------------------------
  // 💰 4. Commission Calculation (for B2C)
  // ----------------------------------------
  async calculateCommission(totalAmount: number): Promise<{ commission: number; netAmount: number }> {
    const config = await this.commissionModel.findOne({ isActive: true });
    const rate = config?.percentage || 10;
    const commission = (totalAmount * rate) / 100;
    const netAmount = totalAmount - commission;
    return { commission, netAmount };
  }

  // ----------------------------------------
  // 🕒 Utility - Timestamp (yyyyMMddHHmmss)
  // ----------------------------------------
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
