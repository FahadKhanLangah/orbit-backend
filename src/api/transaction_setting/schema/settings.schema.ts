import { Schema, Document } from "mongoose";
import { Prop, Schema as NestSchema, SchemaFactory } from "@nestjs/mongoose";

export interface ISettings extends Document {
  giftCommissionPercentage: number;
  videoPurchaseCommissionPercentage: number;
  enableOrbitWaterMark?: boolean;
  minimumWithdrawAmount?: number;
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
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
