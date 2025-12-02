import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class SupportDto {
  @IsNotEmpty()
  @IsString()
  toUser: string; // artist user ID

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number; // donation amount
}
