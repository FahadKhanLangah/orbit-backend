import { IsString, IsNotEmpty, IsArray, ArrayMinSize, IsNumber, Min, IsUrl, IsOptional } from 'class-validator';

export class CreateJobSeekerDto {
  @IsString()
  @IsNotEmpty()
  headline: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  skills: string[];

  @IsNumber()
  @Min(0)
  yearsOfExperience: number;

  @IsUrl()
  @IsOptional() 
  cvUrl?: string;
}
