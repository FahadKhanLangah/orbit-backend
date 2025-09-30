import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ISubscriptionPlan = SubscriptionPlan & Document;

@Schema({ timestamps: { createdAt: "createdAt" } })
export class SubscriptionPlan {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: false })
  description?: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: String, required: true })
  currency: string;

  @Prop({ type: Number, required: true })
  durationInDays: number;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const SubscriptionPlanSchema =
  SchemaFactory.createForClass(SubscriptionPlan);
