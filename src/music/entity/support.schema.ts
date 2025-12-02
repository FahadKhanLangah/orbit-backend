import { Schema, Types } from "mongoose";

export const enum SupportStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export interface ISupport {
  fromUser: Types.ObjectId;
  toUser: Types.ObjectId;
  amount: number;
  status: SupportStatus;
  mpesaTransactionId?: string;
}

export const SupportSchema = new Schema(
  {
    fromUser: { type: Types.ObjectId, ref: "User", required: true },
    toUser: { type: Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: SupportStatus.PENDING },
    mpesaTransactionId: { type: String, default: null },
  },
  { timestamps: true }
);
