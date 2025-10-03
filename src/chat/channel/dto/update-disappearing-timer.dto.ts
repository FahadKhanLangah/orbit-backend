import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export enum DisappearingTimerValues {
  OFF = 0,
  ONE_DAY = 86400,   
  SEVEN_DAYS = 604800, // 7 days
  NINETY_DAYS = 7776000, // 90 days
}

export class UpdateDisappearingTimerDto {
  @IsNumber()
  @IsEnum(DisappearingTimerValues)
  disappearingTimer: number;
}