import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class BroadcastMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  imageUrl?: string;
}
