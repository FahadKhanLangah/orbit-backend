import { IsMongoId, IsNotEmpty } from 'class-validator';

export class SendGiftDto {
  @IsNotEmpty()
  @IsMongoId()
  giftId: string;
}