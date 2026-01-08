export enum ListingStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  INACTIVE = "inactive",
  SOLD = "sold",
  EXPIRED = "expired",
  BANNED = "banned"
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
  HOME = 'home',
  PROFESSIONAL = 'professional',
  PERSONAL = 'personal',
  EVENTS = 'events'
}

export enum PricingModel {
  HOURLY = 'hourly',
  FIXED = 'fixed',
  QUOTE = 'quote'
}

export enum AgeGroup {
  NEWBORN = '0-12m',
  TODDLER = '1-3y',
  PRESCHOOL = '3-5y',
  SCHOOL_AGE = '5-12y',
  TEEN = '12y+',
  NOT_SPECIFIED = "not-specified"
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  UNISEX = "unisex",
  NOT_SPECIFIED = "not-specified",
  BOY = "boy",
  GIRL = "girl",
  KIDS = "kids"
}

export enum SportActivity {
  GYM = 'gym',
  HIKING = 'hiking',
  CAMPING = 'camping',
  TEAM_SPORTS = 'team_sports',
  WATER_SPORTS = 'water_sports',
  CYCLING = 'cycling'
}

export enum HobbyType {
  BOOK = 'book',
  INSTRUMENT = 'instrument',
  ART = 'art',
  OTHER = 'other'
}