import { Type } from "class-transformer";
import { IsNotEmpty, IsNotEmptyObject, IsOptional, IsString, ValidateNested } from "class-validator";

export class DocumentsDto {
  @IsOptional()
  @IsString()
  nationalId?: string;

  @IsOptional()
  @IsString()
  passport?: string;

  @IsOptional()
  @IsString()
  driversLicense?: string;

  @IsOptional()
  @IsString()
  logbook?: string;

  @IsOptional()
  @IsString()
  psvInsurance?: string;

  @IsOptional()
  @IsString()
  vehicleInspection?: string;

  @IsOptional()
  @IsString()
  kraPin?: string;

  @IsOptional()
  @IsString()
  driverPhoto?: string;
}


export class CreateDriverDto {
  @IsNotEmptyObject({}, { message: 'Documents object cannot be empty.' })
  @ValidateNested()
  @Type(() => DocumentsDto)
  documents: DocumentsDto;
}