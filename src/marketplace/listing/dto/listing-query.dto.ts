import { IsOptional, IsString, IsNumber, IsEnum, IsBoolean } from "class-validator";
import { Type } from "class-transformer";
import { Condition, FuelType, FurnishingStatus, PropertyType, TransactionType, TransmissionType } from "../entity/listing.entity";


export class ListingQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  radius?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sort?: "recent" | "trending" | "priceLow" | "priceHigh";

  @IsOptional() @IsEnum(TransactionType)
  transactionType?: TransactionType;

  @IsOptional() @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @IsOptional() @IsNumber() @Type(() => Number)
  bedrooms?: number;

  @IsOptional() @IsNumber() @Type(() => Number)
  bathrooms?: number;

  @IsOptional() @IsNumber() @Type(() => Number)
  minSqFt?: number;

  @IsOptional() @IsEnum(FurnishingStatus)
  furnishing?: FurnishingStatus;

  @IsOptional() @IsString()
  amenities?: string;

  @IsOptional() @IsString()
  make?: string;

  @IsOptional() @IsString()
  model?: string;

  @IsOptional() @IsNumber() @Type(() => Number)
  minYear?: number;

  @IsOptional() @IsNumber() @Type(() => Number)
  maxMileage?: number;

  @IsOptional() @IsEnum(TransmissionType)
  transmission?: TransmissionType;

  @IsOptional() @IsEnum(FuelType)
  fuel?: FuelType;

  @IsOptional() @IsBoolean() @Type(() => Boolean) // Transform "true" string to boolean
  hasWarranty?: boolean;

  @IsOptional()
  @IsString()
  brand?: string;
}
