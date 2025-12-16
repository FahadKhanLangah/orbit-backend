import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CriteriaDto {
  @IsOptional() @IsString() query?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsNumber() minPrice?: number;
  @IsOptional() @IsNumber() maxPrice?: number;
  @IsOptional() @IsString() location?: string;
}

export class SaveSearchDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @ValidateNested()
  @Type(() => CriteriaDto)
  criteria: CriteriaDto;

  @IsOptional()
  @IsBoolean()
  alerts?: boolean;
}