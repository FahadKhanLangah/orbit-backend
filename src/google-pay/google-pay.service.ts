import { Injectable, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { GooglePayTransaction, GooglePayTransactionDocument, GooglePayStatus } from './google-pay.schema';
import { ProcessGooglePayDto } from './dto/process-payment.dto';
import { IUser } from 'src/api/user_modules/user/entities/user.entity';

@Injectable()
export class GooglePayService {
  private readonly logger = new Logger(GooglePayService.name);
  private stripe: Stripe;

  constructor(
    @InjectModel(GooglePayTransaction.name)
    private readonly gpayModel: Model<GooglePayTransactionDocument>,
    @InjectModel('User') 
    private readonly userModel: Model<IUser>,
    private configService: ConfigService,
  ) {
    // Initialize Stripe with Secret Key
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!apiKey) {
      this.logger.error('STRIPE_SECRET_KEY is missing in .env');
      throw new InternalServerErrorException('Payment service configuration error');
    }

    this.stripe = new Stripe(apiKey, {
      apiVersion: '2025-11-17.clover',
    });
  }

  async processPayment(dto: ProcessGooglePayDto) {
    const orderId = `GPAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const transaction = await this.gpayModel.create({
      userId: dto.userId,
      amount: dto.amount,
      currency: dto.currency,
      orderId: orderId,
      description: dto.description || 'Google Pay Topup',
      paymentToken: dto.paymentData, 
      status: GooglePayStatus.PENDING,
    });

    try {
      this.logger.log(`Initiating Stripe charge for User ${dto.userId} - Amount: ${dto.amount}`);

      // 2. EXTRACT TOKEN / PAYMENT METHOD ID
      // The frontend usually sends the whole paymentData object. 
      // If using @stripe/stripe-react-native, 'dto.paymentData.id' is usually the PaymentMethod ID.
      // If using raw Google Pay web, you might need to pass the token string.
      
      // Scenario A: Frontend sent a Stripe PaymentMethod ID (Preferred)
      const paymentMethodId = dto.paymentData?.id || dto.paymentData?.paymentMethodId;
      
      if (!paymentMethodId) {
         throw new BadRequestException('Invalid payment data: Missing PaymentMethod ID');
      }
      const amountInCents = Math.round(dto.amount * 100);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency: dto.currency.toLowerCase(),
        payment_method: paymentMethodId,
        confirm: true, // Charge immediately
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never' // Google Pay tokens usually don't need redirects
        },
        description: `Order ${orderId} - ${dto.description}`,
        metadata: {
          userId: dto.userId,
          orderId: orderId,
        },
      });

      // 4. VERIFY SUCCESS
      if (paymentIntent.status === 'succeeded') {
        this.logger.log(`Stripe Success: ${paymentIntent.id}`);

        await Promise.all([
          transaction.updateOne({
            status: GooglePayStatus.SUCCESS,
            gatewayTransactionId: paymentIntent.id,
            errorMessage: null,
          }),

          // B. Add money to user wallet ($inc is atomic and thread-safe)
          this.userModel.findByIdAndUpdate(dto.userId, {
            $inc: { balance: dto.amount } 
          })
        ]);

        return {
          success: true,
          message: 'Payment successful',
          newBalance: (await this.userModel.findById(dto.userId)).balance,
          transactionId: transaction._id,
        };
      } else {
        // Handle cases like "requires_action" (3D Secure) if necessary
        throw new Error(`Payment not succeeded. Status: ${paymentIntent.status}`);
      }

    } catch (error) {
      // 6. ERROR HANDLING
      this.logger.error(`Payment Failed: ${error.message}`, error.stack);

      // Mark transaction as Failed in DB
      await transaction.updateOne({
        status: GooglePayStatus.FAILED,
        errorMessage: error.message,
        gatewayTransactionId: error.raw?.payment_intent?.id || null, // Store Stripe ID if available
      });

      // Return a clean error to the frontend
      throw new InternalServerErrorException(error.message || 'Payment processing failed');
    }
  }

  /**
   * Helper to view history
   */
  async getTransactions(userId?: string) {
    const filter = userId ? { userId } : {};
    return this.gpayModel.find(filter).sort({ createdAt: -1 }).exec();
  }
}