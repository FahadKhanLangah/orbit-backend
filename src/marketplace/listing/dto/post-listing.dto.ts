import { IsString, IsNotEmpty, IsNumber, IsOptional, ValidateNested, IsDate, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { FurnishingStatus, PropertyType, TransactionType } from '../entity/listing.entity';

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

  @IsString()
  @IsOptional()
  brand: string;

  @IsString()
  @IsOptional()
  condition: string;

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
  };


  @IsOptional()
  @IsEnum(TransactionType)
  transactionType?: TransactionType;

  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyDetailsDto)
  propertyDetails?: PropertyDetailsDto;
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

  @IsString()
  @IsOptional()
  category: string;

  @IsString()
  @IsOptional()
  brand: string;

  @IsString()
  @IsOptional()
  condition: string;

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
  };
}
