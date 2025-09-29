import { Schema, Document } from "mongoose";
import { Prop, Schema as NestSchema, SchemaFactory } from "@nestjs/mongoose";

export interface ISettings extends Document {
  giftCommissionPercentage: number;
  videoPurchaseCommissionPercentage: number;
  enableOrbitWaterMark?: boolean;
  minimumWithdrawAmount?: number;
  verificationFee?: number;
  adPricePerMinute?: number;
  adRequiredDimensions?: string;
}

@NestSchema({ timestamps: true })
export class Settings {
  @Prop({ type: Number, required: true, default: 5, min: 0, max: 100 })
  giftCommissionPercentage: number;

  @Prop({ type: Number, required: true, default: 10, min: 0, max: 100 })
  videoPurchaseCommissionPercentage: number;

  @Prop({ type: Boolean, default: false })
  enableOrbitWaterMark: boolean;

  @Prop({ type: Number, default: 1 })
  minimumWithdrawAmount: number;

  @Prop({ default: 25 })
  verificationFee: number;

  @Prop({ type: Number, default: 0.01, min: 0 })
  adPricePerMinute: number;

  @Prop({ type: String, default: "1080x400" })
  adRequiredDimensions: string;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
