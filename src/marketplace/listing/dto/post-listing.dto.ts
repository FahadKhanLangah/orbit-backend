import { IsString, IsNotEmpty, IsNumber, IsOptional, ValidateNested, IsDate, IsEnum, IsArray, IsBoolean, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DimensionUnit, FuelType, FurnishingStatus, PetGender, PropertyType, TransactionType, TransmissionType, VehicleType } from '../entity/listing.entity';

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

  @IsString()
  @IsOptional()
  pricing: string

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
}
