import { IsNotEmpty, IsNumber, IsString, IsObject, IsOptional } from 'class-validator';

export class ProcessGooglePayDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsObject()
  paymentData: any;
}