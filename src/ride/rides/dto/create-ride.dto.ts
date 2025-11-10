import { Type } from 'class-transformer';
import {
  IsDate,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  MinDate,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '../entity/ride.entity';
import { VehicleCategory } from 'src/ride/vehicle/entity/vehicle.entity';

class LocationDto {
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;
}


export class CreateRideDto {
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => LocationDto)
  pickup: LocationDto;

  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => LocationDto)
  destination: LocationDto;

  @IsNotEmpty()
  paymentMethod?: PaymentMethod;

  @IsNotEmpty()
  @IsString()
  category: VehicleCategory;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @MinDate(new Date(Date.now() + 15 * 60 * 1000), { message: 'Scheduled time must be at least 15 minutes in the future.' })
  scheduledTime?: Date;
}