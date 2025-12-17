import { IsString, IsNotEmpty, IsNumber, IsOptional, ValidateNested, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

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
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  condition: string;

  @ValidateNested()
  @Type(() => LocationDto)
  @IsOptional()
  location?: LocationDto;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiry?: Date;
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
}
