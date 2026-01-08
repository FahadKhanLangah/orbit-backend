import { IsEnum, IsOptional, IsString } from "class-validator";
import { MarketUserRole } from "../enums/market.enums";


export class CreateMarketUserDto {
  @IsString()
  @IsOptional()
  userId?: string

  @IsEnum(MarketUserRole)
  role: string

  @IsString()
  bio: string
}