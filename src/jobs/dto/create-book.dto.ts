import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty() @IsString()
  title: string;

  @IsNotEmpty() @IsString()
  previewText: string;

  @IsNotEmpty() @IsString()
  fullContent: string; 

  @IsBoolean()@IsOptional()
  isForSale: boolean;

  @IsOptional() @IsNumber()
  price: number;
}