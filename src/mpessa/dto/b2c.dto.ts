import { IsNotEmpty, IsPhoneNumber, IsNumber, IsOptional, IsString } from 'class-validator';

export class B2CDto {
  @IsPhoneNumber('KE', { message: 'Invalid Kenyan phone number format' })
  phone: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsString()
  @IsOptional()
  occasion?: string;
}
