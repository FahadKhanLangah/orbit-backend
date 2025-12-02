import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateVideoDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
