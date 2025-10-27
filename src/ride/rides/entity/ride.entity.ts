import { Document, Schema } from "mongoose";
import { VehicleCategory } from "src/ride/vehicle/entity/vehicle.entity";

export enum RideStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Scheduled = 'scheduled',
  NoDriversAvailable = 'no_drivers_available'
}

export enum PaymentStatus {
  Unpaid = 'unpaid',
  Paid = 'paid'
}

export enum PaymentMethod {
  Cash = 'cash',
  Wallet = 'wallet',
  Online = 'online'
}
export interface IRide extends Document {
  _id: string;
  userId: string;
  driverId?: string;
  vehicleId?: string;
  pickup: {
    address: string;
    latitude: number;
    longitude: number;
  },
  destination: {
    address: string;
    latitude: number;
    longitude: number;
  },
  distance: number;
  duration: number;
  fare: number;
  fareBreakdown: {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    weatherMultiplier: number;
    roadConditionMultiplier: number;
    nightMultiplier: number;
    fuelTypeAdjustment: number;
  },
  estimatedFare: number;
  systemCommission: number;
  status: RideStatus;
  category: VehicleCategory;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  scheduledTime?: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const RideSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  driverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
  pickup: {
    address: String,
    latitude: Number,
    longitude: Number,
  },
  destination: {
    address: String,
    latitude: Number,
    longitude: Number,
  },
  distance: Number,
  duration: Number,
  fare: Number,
  fareBreakdown: {
    baseFare: Number,
    distanceFare: Number,
    timeFare: Number,
    weatherMultiplier: Number,
    roadConditionMultiplier: Number,
    nightMultiplier: Number,
    fuelTypeAdjustment: Number,
  },
  estimatedFare: { type: Number },
  systemCommission: { type: Number },
  status: {
    type: String,
    enum: RideStatus,
    default: RideStatus.Pending
  },
  category: { type: String, enum: VehicleCategory, required: true },
  paymentMethod: { type: String, enum: PaymentMethod, default: PaymentMethod.Cash },
  paymentStatus: { type: String, enum: PaymentStatus, default: PaymentStatus.Unpaid },
  scheduledTime: { type: Date, default: null },
  startedAt: { type: Date },
  completedAt: { type: Date },
}, { timestamps: true });
