import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAudioDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
