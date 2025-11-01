import { IsString, IsNotEmpty, IsEnum, MinLength, MaxLength } from 'class-validator';
import { JobCategory } from '../entity/jobs.entity';


export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  description: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  qualifications: string;

  @IsString()
  @IsNotEmpty()
  salaryRange: string;

  @IsEnum(JobCategory)
  @IsNotEmpty()
  category: JobCategory;

  @IsString()
  @IsNotEmpty()
  location: string;
}
