import { IsMongoId, IsNotEmpty } from 'class-validator';

export class PurchaseSubscriptionDto {
  @IsNotEmpty()
  @IsMongoId({ message: 'A valid plan ID is required.' })
  planId: string;
}