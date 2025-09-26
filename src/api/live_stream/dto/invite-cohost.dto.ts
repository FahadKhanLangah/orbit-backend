import { IsNotEmpty, IsMongoId } from 'class-validator';

export class InviteCoHostDto {
  @IsNotEmpty()
  @IsMongoId() // Ensures the provided ID is a valid MongoDB ObjectId
  guestUserId: string;
}