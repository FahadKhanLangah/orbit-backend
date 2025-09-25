import { IsNumber, Max, Min } from 'class-validator';

export class CreateSettingsDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  giftCommissionPercentage: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  videoPurchaseCommissionPercentage: number;
}