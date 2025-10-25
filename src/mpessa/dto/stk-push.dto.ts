
import { IsNotEmpty, IsPhoneNumber, IsNumber, IsOptional, IsString } from 'class-validator';

export class StkPushDto {
  @IsPhoneNumber('KE', { message: 'Invalid Kenyan phone number format (e.g., +2547XXXXXXXX)' })
  phone: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  accountReference: string; // e.g. Ride ID, Order ID, etc.

  @IsString()
  @IsOptional()
  transactionDesc?: string;

  @IsString()
  @IsOptional()
  callbackUrl?: string;
}
