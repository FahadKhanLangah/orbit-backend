import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { driverProfileStatus } from "../entity/driver.entity";

export class UpdateDriverStatusDto {
  @IsNotEmpty()
  @IsEnum(driverProfileStatus, { message: 'Status must be one of: pending, approved, rejected' })
  status: driverProfileStatus;
}

export class GetDriversFilterDto {
  @IsOptional()
  @IsEnum(driverProfileStatus)
  status?: driverProfileStatus;
}