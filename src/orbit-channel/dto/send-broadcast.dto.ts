import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class SendBroadcastDto {
  @IsString()
  @IsOptional()
  content?: string;
}
