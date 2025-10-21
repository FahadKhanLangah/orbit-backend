import { Schema } from 'mongoose';

export enum VehicleCategory {
  OrbitComfort = 'OrbitComfort',
  OrbitX = 'OrbitX',
  Economy = 'Economy',
  OrbitXL = 'OrbitXL',
  OrbitGreen = 'OrbitGreen',
  WomenOnly = 'WomenOnly',
  OrbitShare = 'OrbitShare',
  OrbitVans = 'OrbitVans',
  OrbitMotorbike = 'OrbitMotorbike',
  OrbitElectric = 'OrbitElectric',
  OrbitSend = 'OrbitSend',
  OrbitFood = 'OrbitFood'
}

export enum VehicleType {
  Car = 'car',
  Motorbike = 'motorbike'
}

export enum FuelType {
  Electric = 'electric',
  Fuel = 'fuel'
}

export enum VehicleCondition {
  Good = 'good',
  Fair = 'fair',
  Poor = 'poor'
}

export interface IVehicle {
  _id: string;
  driverId: string;
  category: VehicleCategory,
  type: VehicleType;
  model: string;
  numberPlate: string;
  capacity: number;
  fuelType: FuelType;
  image?: string;
  condition: VehicleCondition;
  isActive: boolean;
  // charges
  rideRates: {
    chargesPerKm?: number;
    chargesPerMinute?: number;
  }
  createdAt: Date;
  updatedAt: Date;
}

export const VehicleSchema = new Schema({
  driverId: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
  type: { type: String, enum: VehicleType, required: true },
  category: {
    type: String,
    enum: VehicleCategory,
    required: true
  },
  model: String,
  numberPlate: String,
  capacity: Number,
  fuelType: { type: String, enum: FuelType, default: 'fuel' },
  image: String,
  condition: { type: String, enum: VehicleCondition, default: 'good' },
  isActive: { type: Boolean, default: true },
  rideRates: {
    chargesPerKm: { type: Number, default: 1 },
    chargesPerMinute: { type: Number, default: 1 },
  },
}, { timestamps: true });
