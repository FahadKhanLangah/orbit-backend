import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { JobCategory } from '../entity/jobs.entity';

export class FindJobsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number) // Transform query param string to number
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number) // Transform query param string to number
  limit: number = 10;

  @IsOptional()
  @IsString()
  q?: string; // Search query

  @IsOptional()
  @IsEnum(JobCategory)
  category?: JobCategory; // Filter by category

  @IsOptional()
  @IsString()
  location?: string; // Filter by location
}
