import { Schema } from "mongoose";

export interface ILoyaltyPoints {
  _id: string;
  userId: string;
  totalPoints: number;
  earnedFromRides: {
    rideId: string;
    points: number;
    date: Date;
  }[];
  redeemedHistory: {
    points: number;
    amount: number;
    date: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}


export const LoyaltyPointsSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  totalPoints: { type: Number, default: 0 },
  earnedFromRides: [{
    rideId: { type: Schema.Types.ObjectId, ref: 'Ride' },
    points: Number,
    date: Date,
  }],
  redeemedHistory: [{
    points: Number,
    amount: Number,
    date: Date,
  }]
}, { timestamps: true });
