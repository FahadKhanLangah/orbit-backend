// src/rides/dto/get-fare-estimate.dto.ts

import { Type } from 'class-transformer';
import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNotEmptyObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { VehicleCategory } from 'src/ride/vehicle/entity/vehicle.entity';

// A reusable DTO for location data
class LocationDto {
  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;
}



// The main DTO for the fare estimate request
export class GetFareEstimateDto {
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => LocationDto)
  pickup: LocationDto;

  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => LocationDto)
  destination: LocationDto;

  @IsNotEmpty()
  @IsEnum(VehicleCategory)
  category: VehicleCategory;
}