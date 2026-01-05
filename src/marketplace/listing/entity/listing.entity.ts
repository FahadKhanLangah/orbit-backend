import mongoose, { Document } from 'mongoose';

export enum ListingStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  INACTIVE = "inactive",
  SOLD = "sold",
  EXPIRED = "expired"
}
export enum PricingStructure {
  FIXED = "fixed",
  NEGOTIABLE = "negotiable"
}

export enum TransactionType {
  BUY = 'buy',
  RENT = 'rent',
  LEASE = 'lease'
}

export enum PropertyType {
  HOUSE = 'house',
  APARTMENT = 'apartment',
  LAND = 'land',
  COMMERCIAL = 'commercial',
  CONDO = 'condo'
}

export enum FurnishingStatus {
  FURNISHED = 'furnished',
  SEMI_FURNISHED = 'semi-furnished',
  UNFURNISHED = 'unfurnished'
}

export enum VehicleType {
  CAR = 'car',
  BIKE = 'bike',
  TRUCK = 'truck',
  BUS = 'bus',
  BOAT = 'boat',
  OTHER = 'other'
}

export enum TransmissionType {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
  CVT = 'cvt'
}

export enum FuelType {
  PETROL = 'petrol',
  DIESEL = 'diesel',
  HYBRID = 'hybrid',
  ELECTRIC = 'electric',
  LPG = 'lpg',
  CNG = 'cng'
}

export enum Condition {
  NEW = 'new',
  USED = 'used',
  REFURBISHED = 'refurbished',
  OPEN_BOX = 'open_box'
}

export enum DimensionUnit {
  CM = 'cm',
  INCH = 'in',
  FT = 'ft',
  M = 'm'
}

export enum ClothingSize {
  XS = 'XS', S = 'S', M = 'M', L = 'L', XL = 'XL', XXL = 'XXL',
  US_30 = '30', US_32 = '32', US_34 = '34'
}

export enum PetGender {
  MALE = 'male',
  FEMALE = 'female'
}

export enum ServiceCategory {
  HOME = 'home',           // Cleaning, Plumbing, Repair
  PROFESSIONAL = 'professional', // Legal, Accounting, Tech
  PERSONAL = 'personal',   // Fitness, Beauty, Tutoring
  EVENTS = 'events'        // Photography, Catering
}

export enum PricingModel {
  HOURLY = 'hourly',
  FIXED = 'fixed',
  QUOTE = 'quote'
}

export interface IListing extends Document {
  title: string;
  description?: string;
  price?: number;
  pricing?: string;
  image: string[];
  threeSixtyImageUrl?: string;
  category: string;
  brand: string;
  video?: string;
  condition: string;
  location?: {};
  impressions: {
    inDays: number;
    totalImpressions: number;
  };
  status: string;
  expiry?: Date;
  postBy: mongoose.Types.ObjectId;
  hide: boolean;
  deliveryOptions: {
    pickup: boolean;
    shipping: boolean;
    shippingFee?: number;
    transportNotes?: string;
  };
  expiryDate: Date;
  isExpired: boolean;
  transactionType?: TransactionType;


  propertyDetails?: {
    type: PropertyType;          // House/Apartment
    bedrooms?: number;            // Feature 58
    bathrooms?: number;           // Feature 59
    areaSqFt?: number;            // Feature 60
    furnishing?: FurnishingStatus;// Feature 61
    amenities?: string[];         // Feature 62: ['Pool', 'Gym', 'Parking']
    petFriendly?: boolean;
  };

  vehicleDetails?: {
    type: VehicleType;          // Feature 66
    make: string;               // Feature 67 (e.g. Toyota)
    model: string;              // Feature 67 (e.g. Corolla)
    year: number;
    mileage: number;
    transmission: TransmissionType;
    fuel: FuelType;
    color?: string;
    registeredCity?: string;
    vin?: string;
    historyNotes?: string;
  };

  warranty?: {
    available: boolean;
    duration?: string;
    expiryDate?: Date;
  };
  specifications?: Map<string, string>;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: DimensionUnit;
    weight?: number;
    weightUnit?: 'kg' | 'lb';
  };
  clothingDetails?: {
    size: string;
    color: string;
    material?: string;
    gender?: string;
    brand?: string;
  };
  petDetails?: {
    animalType: string;
    breed: string;
    age?: number;
    ageUnit?: 'months' | 'years';
    gender?: PetGender;
    vaccinated?: boolean;
    vaccinations?: {
      name: string;
      dateAdministered: Date;
    }[];
    certificateImage?: string;
  };
  serviceDetails?: {
    category: ServiceCategory;
    subCategory: string;
    pricingModel: PricingModel;
    availableDays: string[];
    experienceYears?: number;
  };
}

export const ListingSchema = new mongoose.Schema<IListing>({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number },
  pricing: { type: String, default: PricingStructure.FIXED, enum: PricingStructure },
  image: [{ type: String }], // keys or urls
  threeSixtyImageUrl: { type: String },
  category: { type: String, required: true },
  brand: { type: String },
  video: { type: String },
  condition: { type: String },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    address: { type: String }
  },

  transactionType: {
    type: String,
    enum: Object.values(TransactionType),
    default: TransactionType.BUY
  },
  propertyDetails: {
    type: { type: String, enum: Object.values(PropertyType) },
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    areaSqFt: { type: Number },
    furnishing: { type: String, enum: Object.values(FurnishingStatus) },
    amenities: [{ type: String }],
    petFriendly: { type: Boolean, default: false }
  },

  impressions: {
    inDays: { type: Number, default: 0 },
    totalImpressions: { type: Number, default: 0 },
  },
  vehicleDetails: {
    type: { type: String, enum: Object.values(VehicleType) },
    make: { type: String, trim: true },
    model: { type: String, trim: true },
    year: { type: Number },
    mileage: { type: Number },
    transmission: { type: String, enum: Object.values(TransmissionType) },
    fuel: { type: String, enum: Object.values(FuelType) },
    color: { type: String },
    registeredCity: { type: String },
    vin: { type: String, trim: true },
    historyNotes: { type: String }
  },
  dimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number },
    unit: { type: String, enum: Object.values(DimensionUnit), default: DimensionUnit.CM },
    weight: { type: Number },
    weightUnit: { type: String, enum: ['kg', 'lb'] }
  },
  status: { type: String, default: ListingStatus.DRAFT, enum: ListingStatus },
  expiry: { type: Date },
  postBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hide: { type: Boolean, default: false },
  deliveryOptions: {
    pickup: { type: Boolean, default: true },
    shipping: { type: Boolean, default: false },
    shippingFee: { type: Number, default: 0 },
    transportNotes: { type: String, maxlength: 300 }
  },
  expiryDate: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  isExpired: { type: Boolean, default: false },
  warranty: {
    available: { type: Boolean, default: false },
    duration: { type: String },
    expiryDate: { type: Date }
  },
  specifications: {
    type: Map,
    of: String
  },
  clothingDetails: {
    size: { type: String },
    color: { type: String },
    material: { type: String },
    gender: { type: String, enum: ['men', 'women', 'unisex', 'kids'] },
    brand: { type: String }
  },
  serviceDetails: {
    category: { type: String, enum: Object.values(ServiceCategory) },
    subCategory: { type: String },
    pricingModel: { type: String, enum: Object.values(PricingModel), default: PricingModel.QUOTE },
    availableDays: [{ type: String }],
    experienceYears: { type: Number }
  },
  petDetails: {
    animalType: { type: String }, // e.g. "Dog"
    breed: { type: String, trim: true },
    age: { type: Number },
    ageUnit: { type: String, enum: ['months', 'years'] },
    gender: { type: String, enum: Object.values(PetGender) },
    vaccinated: { type: Boolean }
  }
}, { timestamps: true });

ListingSchema.index({
  title: "text",
  description: "text",
  category: "text",
  brand: "text"
});

ListingSchema.index({ 'propertyDetails.bedrooms': 1, 'propertyDetails.type': 1 });
ListingSchema.index({ transactionType: 1 });
ListingSchema.index({ 'vehicleDetails.make': 1, 'vehicleDetails.model': 1 });
ListingSchema.index({ 'vehicleDetails.year': -1 });
ListingSchema.index({ 'warranty.available': 1 });
ListingSchema.index({ 'clothingDetails.size': 1, 'clothingDetails.color': 1 });
ListingSchema.index({ 'petDetails.animalType': 1, 'petDetails.breed': 1 });
ListingSchema.index({ 'serviceDetails.category': 1, 'serviceDetails.subCategory': 1 });


export const Listing = mongoose.model<IListing>('Listing', ListingSchema);
