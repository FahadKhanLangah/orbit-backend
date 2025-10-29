import { IsEnum, IsLatitude, IsLongitude, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export enum LocationType {
  Home = 'home',
  Work = 'work',
  Family = 'family',
}

export class UpdateMyWorkLocationDto {
  @IsEnum(LocationType)
  @IsNotEmpty()
  type: LocationType; // 'home', 'work', or 'family'

  @IsNumber()
  @IsLatitude()
  latitude: number;

  @IsNumber()
  @IsLongitude()
  longitude: number;

  @IsString()
  @IsOptional()
  address?: string;
}
