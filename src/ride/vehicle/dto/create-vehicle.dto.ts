import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { VehicleCategory, VehicleCondition, VehicleType } from "../entity/vehicle.entity";


export class CreateVehicleDto {


  @IsEnum(VehicleCategory)
  category: VehicleCategory;

  @IsEnum(VehicleType)
  type: VehicleType;

  @IsString()
  model: string;

  @IsString()
  numberPlate: string;

  @IsString()
  capacity: string;

  @IsString()
  fuelType: string;

  @IsEnum(VehicleCondition)
  condition: VehicleCondition;
  @IsOptional()
  @IsNumber()
  chargesPerKm?: Number;

  @IsOptional()
  @IsNumber()
  chargesPerMinute?: Number;

}