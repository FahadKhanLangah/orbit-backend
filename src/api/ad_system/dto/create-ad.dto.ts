import { Type } from 'class-transformer';
import { IsNumber, IsPositive, IsUrl } from 'class-validator';

export class CreateAdDto {
  @IsUrl({}, { message: 'A valid link URL is required for the ad.' })
  linkUrl: string;
  
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: 'Duration must be a positive number of minutes.' })
  durationInMinutes: number;
}






// import { IsString, IsIn, IsNotEmpty } from 'class-validator';

// export class CreateAdDto {
//   @IsString()
//   @IsNotEmpty()
//   linkUrl: string;

//   @IsString()
//   @IsIn(['1_day', '30_days', '1_year']) // Allowed duration options
//   durationOption: string;
// }