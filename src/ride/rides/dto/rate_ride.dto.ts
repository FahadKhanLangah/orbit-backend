import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class RateRideDto {
  @IsInt()
  @Min(1, { message: 'Rating must be at least 1.' })
  @Max(5, { message: 'Rating cannot be more than 5.' })
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Comment cannot be longer than 500 characters.' })
  comment?: string;
}