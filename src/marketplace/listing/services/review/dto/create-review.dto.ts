import { IsString, IsNotEmpty, IsNumber, Min, Max, IsMongoId, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @IsMongoId()
  @IsNotEmpty()
  listingId: string;

  @IsMongoId()
  @IsNotEmpty()
  sellerId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}