import { Schema } from 'mongoose';

export enum driverProfileStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected"
}

export interface IDriver {
  _id: string;
  userId: string;
  rating: number;
  totalRides: number;
  status: driverProfileStatus;
  documents: {
    nationalId?: string;
    passport?: string;
    driversLicense?: string;
    logbook?: string;
    psvInsurance?: string;
    vehicleInspection?: string;
    kraPin?: string;
    driverPhoto?: string;
  };
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
  createdAt: Date;
  updatedAt: Date;
}

export const DriverSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  status: { type: String, enum: driverProfileStatus, default: driverProfileStatus.PENDING },
  rating: { type: Number, default: 0 },
  totalRides: { type: Number, default: 0 },
  documents: {
    nationalId: { type: String },
    passport: { type: String },
    driversLicense: { type: String },
    logbook: { type: String },
    psvInsurance: { type: String },
    vehicleInspection: { type: String },
    kraPin: { type: String },
    driverPhoto: { type: String },

  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
  createdAt: Date,
  updatedAt: Date,
}, { timestamps: true });


