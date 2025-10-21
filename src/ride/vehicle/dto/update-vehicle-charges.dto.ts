// src/vehicles/dto/update-vehicle-charges.dto.ts

import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class UpdateVehicleChargesDto {
  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'Charges per Km must be a positive number.' })
  chargesPerKm?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'Charges per minute must be a positive number.' })
  chargesPerMinute?: number;
}