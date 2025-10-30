import { IsBoolean, IsNumber, IsOptional } from "class-validator";


export class UpdatePointsSetting {
  @IsOptional()
  @IsNumber()
  pointsPerRide: number;

  @IsOptional()
  @IsNumber()
  pointsToCurrencyRate: number;

  @IsOptional()
  @IsBoolean()
  isActive: boolean
}