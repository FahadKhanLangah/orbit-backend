import { IsNotEmpty, IsString } from 'class-validator';

export class TransactionStatusDto {
  @IsString()
  @IsNotEmpty()
  transactionID: string;
}
