import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GooglePayTransactionDocument = GooglePayTransaction & Document;

export enum GooglePayStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Schema({ timestamps: true })
export class GooglePayTransaction {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true, unique: true })
  orderId: string; // Your internal unique reference

  @Prop({ required: true, enum: GooglePayStatus, default: GooglePayStatus.PENDING })
  status: GooglePayStatus;

  @Prop()
  description: string;

  @Prop({ type: Object })
  paymentToken: any; // Stores the raw token from Google (encrypted)

  @Prop()
  gatewayTransactionId: string; // ID from Stripe/Adyen/Braintree

  @Prop()
  errorMessage: string;
}

export const GooglePayTransactionSchema = SchemaFactory.createForClass(GooglePayTransaction);