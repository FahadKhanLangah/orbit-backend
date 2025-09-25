import { IsBoolean, IsNumber, IsOptional, Max, Min } from "class-validator";

export class UpdateSettingsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  giftCommissionPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  videoPurchaseCommissionPercentage?: number;

  @IsOptional()
  @IsBoolean()
  enableOrbitWaterMark?: boolean;

  @IsOptional()
  @IsNumber()
  minimumWithdrawAmount?: number;

  @IsOptional()
  @IsNumber()
  verificationFee?: number;

}
