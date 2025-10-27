import { Type } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNotEmptyObject,
  IsString,
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
}