import { IsEnum, IsOptional, IsString } from "class-validator";
import { MarketUserRole } from "../entity/market_user.entity";

export class CreateMarketUserDto {
  @IsString()
  @IsOptional()
  userId?: string

  @IsEnum(MarketUserRole)
  role: string

  @IsString()
  bio: string
}