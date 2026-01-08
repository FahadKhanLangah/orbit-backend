import { IsString, IsNotEmpty, IsNumber, IsOptional, ValidateNested, IsDate, IsEnum, IsArray, IsBoolean, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AgeGroup, DimensionUnit, FuelType, FurnishingStatus, Gender, HobbyType, PetGender, PricingModel, PropertyType, ServiceCategory, SportActivity, TransactionType, TransmissionType, VehicleType } from '../enums/listing.enum';

export class LocationDto {
  @IsNumber()
  @Type(() => Number)
  lat: number;

  @IsNumber()
  @Type(() => Number)
  lng: number;

  @IsString()
  @IsOptional()
  address?: string;

  toGeoJSON() {
    return {
      type: "Point",
      coordinates: [this.lng, this.lat],
      address: this.address,
    };
  }
}

class WarrantyDto {
  @IsBoolean()
  available: boolean;

  @IsOptional() @IsString()
  duration?: string;

  @IsOptional() @IsDate() @Type(() => Date)
  expiryDate?: Date;
}

class PropertyDetailsDto {
  @IsEnum(PropertyType)
  type: PropertyType;

  @IsOptional() @IsNumber()
  bedrooms?: number;

  @IsOptional() @IsNumber()
  bathrooms?: number;

  @IsOptional() @IsNumber()
  areaSqFt?: number;

  @IsOptional() @IsEnum(FurnishingStatus)
  furnishing?: FurnishingStatus;

  @IsOptional() @IsArray() @IsString({ each: true })
  amenities?: string[];

  @IsOptional() @IsBoolean()
  petFriendly?: boolean;

  @IsOptional()
  @IsString()
  vin?: string;

  @IsOptional()
  @IsString()
  historyNotes?: string;
}

class VehicleDetailsDto {
  @IsEnum(VehicleType)
  type: VehicleType;

  @IsString() @IsNotEmpty()
  make: string;

  @IsString() @IsNotEmpty()
  model: string;

  @IsNumber()
  @Min(1900) @Max(new Date().getFullYear() + 1)
  year: number;

  @IsNumber() @Min(0)
  mileage: number;

  @IsEnum(TransmissionType)
  transmission: TransmissionType;

  @IsEnum(FuelType)
  fuel: FuelType;

  @IsOptional() @IsString()
  color?: string;
}

class DimensionsDto {
  @IsNumber()
  length: number;

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsEnum(DimensionUnit)
  unit: DimensionUnit;

  @IsOptional() @IsNumber()
  weight?: number;
}

class ClothingDetailsDto {
  @IsString() @IsNotEmpty()
  size: string;

  @IsString() @IsNotEmpty()
  color: string;

  @IsOptional() @IsString()
  brand?: string;

  @IsOptional() @IsEnum(['men', 'women', 'unisex', 'kids'])
  gender?: string;
}

class ServiceDetailsDto {
  @IsEnum(ServiceCategory)
  category: ServiceCategory;

  @IsString() @IsNotEmpty()
  subCategory: string;

  @IsEnum(PricingModel)
  pricingModel: PricingModel;

  @IsArray()
  @IsString({ each: true })
  availableDays: string[];

  @IsOptional() @IsNumber()
  experienceYears?: number;
}

class VaccineDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsDate() @Type(() => Date)
  dateAdministered: Date;
}

class PetDetailsDto {
  @IsString() @IsNotEmpty()
  animalType: string;

  @IsString() @IsNotEmpty()
  breed: string;

  @IsOptional() @IsEnum(PetGender)
  gender?: PetGender;

  @IsOptional() @IsNumber()
  age?: number;

  @IsBoolean()
  vaccinated: boolean;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => VaccineDto)
  vaccinations?: VaccineDto[];
}

export class KidsDetailsDto {
  @IsEnum(AgeGroup)
  ageGroup: AgeGroup;

  @IsOptional() @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  safetyWarnings?: string[];
}

class SportsDetailsDto {
  @IsEnum(SportActivity)
  activity: SportActivity;

  @IsOptional() @IsString()
  size?: string;

  @IsOptional() @IsEnum(Gender)
  gender?: Gender;
}

class HobbyDetailsDto {
  @IsEnum(HobbyType)
  type: HobbyType;

  @IsOptional() @IsString()
  author?: string;

  @IsOptional() @IsString()
  isbn?: string;

  @IsOptional() @IsString()
  instrumentType?: string; // e.g. "Electric Guitar"

  // Feature 100
  @IsOptional() @IsBoolean()
  isCollectible?: boolean;
}

export class PostListingDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price?: number;

  @IsString()
  @IsOptional()
  pricing: string

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsString()
  threeSixtyImageUrl?: string;

  @IsString()
  @IsOptional()
  brand: string;

  @IsString()
  @IsOptional()
  condition: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => WarrantyDto)
  warranty?: WarrantyDto;

  @ValidateNested()
  @Type(() => LocationDto)
  @IsOptional()
  location?: LocationDto;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiry?: Date;

  @IsOptional()
  deliveryOptions?: {
    pickup: boolean;
    shipping: boolean;
    shippingFee?: number;
    transportNotes?: string;
  };


  @IsOptional()
  @IsEnum(TransactionType)
  transactionType?: TransactionType;

  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyDetailsDto)
  propertyDetails?: PropertyDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VehicleDetailsDto)
  vehicleDetails?: VehicleDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions?: DimensionsDto;


  @IsOptional()
  @ValidateNested()
  @Type(() => ClothingDetailsDto)
  clothingDetails?: ClothingDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PetDetailsDto)
  petDetails?: PetDetailsDto;

  @IsOptional() specifications?: Record<string, string>;

  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceDetailsDto)
  serviceDetails?: ServiceDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => KidsDetailsDto)
  kidsDetails?: KidsDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SportsDetailsDto)
  sportsDetails?: SportsDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => HobbyDetailsDto)
  hobbyDetails?: HobbyDetailsDto;
}

export class SaveListingDraftDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsEnum(PricingModel)
  pricing: PricingModel = PricingModel.FIXED

  @IsOptional()
  @IsString()
  threeSixtyImageUrl?: string;

  @IsString()
  @IsOptional()
  category: string;

  @IsString()
  @IsOptional()
  brand: string;

  @IsString()
  @IsOptional()
  condition: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => WarrantyDto)
  warranty?: WarrantyDto;

  @ValidateNested()
  @Type(() => LocationDto)
  @IsOptional()
  location?: LocationDto;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiry?: Date;

  @IsOptional()
  deliveryOptions?: {
    pickup: boolean;
    shipping: boolean;
    shippingFee?: number;
    transportNotes?: string;
  };

  @IsOptional()
  @ValidateNested()
  @Type(() => VehicleDetailsDto)
  vehicleDetails?: VehicleDetailsDto;

  @IsOptional() specifications?: Record<string, string>;

  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceDetailsDto)
  serviceDetails?: ServiceDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => KidsDetailsDto)
  kidsDetails?: KidsDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SportsDetailsDto)
  sportsDetails?: SportsDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => HobbyDetailsDto)
  hobbyDetails?: HobbyDetailsDto;
}
