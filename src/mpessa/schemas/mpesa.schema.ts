import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { IUser } from 'src/api/user_modules/user/entities/user.entity';

export type MpesaTransactionDocument = MpesaTransaction & Document;

export enum MpesaTransactionType {
  STK_PUSH = 'STK_PUSH',
  B2C = 'B2C',
  STATUS_QUERY = 'STATUS_QUERY',
}

export enum MpesaTransactionStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Failed = 'Failed',
  CallbackReceived = 'CallbackReceived',
}

export interface IMpesaTransaction {
  transactionType: MpesaTransactionType;
  status: MpesaTransactionStatus;
  amount: number;
  commission: number;
  phone: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ConversationID: string;
  OriginatorConversationID: string;
  mpesaReceiptNumber: string;
  resultCode: string;
  resultDesc: string;
  callbackData: any;
}

@Schema({ timestamps: true })
export class MpesaTransaction {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId | IUser;

  @Prop({ required: true, enum: MpesaTransactionType })
  transactionType: MpesaTransactionType;

  @Prop({ required: true, enum: MpesaTransactionStatus, default: MpesaTransactionStatus.Pending })
  status: MpesaTransactionStatus;

  @Prop()
  amount: number;

  @Prop()
  commission: number; 

  @Prop()
  phone: string; 
  @Prop({ unique: true, sparse: true })
  MerchantRequestID: string;

  /** Safaricom's unique ID for the STK Push request */
  @Prop()
  CheckoutRequestID: string;

  /** Our internal unique ID for B2C or Status Query */
  @Prop({ unique: true, sparse: true })
  ConversationID: string;

  /** Safaricom's unique ID for B2C or Status Query */
  @Prop()
  OriginatorConversationID: string;

  // --- M-Pesa Response Data ---

  /** The final M-Pesa Receipt Number (e.g., QK...) */
  @Prop()
  mpesaReceiptNumber: string;

  @Prop()
  resultCode: string;

  @Prop()
  resultDesc: string;

  /** Stores the entire JSON callback object for debugging */
  @Prop({ type: MongooseSchema.Types.Mixed })
  callbackData: any;
}

export const MpesaTransactionSchema = SchemaFactory.createForClass(MpesaTransaction);
