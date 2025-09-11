// src/orbit-channel/orbit-channel.service.ts
import { IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateOrbitChannelDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional() // This decorator makes the field optional
  readonly name?: string;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsString()
  @IsOptional()
  readonly image?: string;

  @IsString()
  @IsOptional()
  readonly topic?: string;

  @IsBoolean()
  @IsOptional()
  readonly isPublic?: boolean;
}
export class CreateOrbitChannelDto {
    @IsString()   // Rule: Must be a string
    @IsNotEmpty() // Rule: Must not be an empty string
    name: string;

    @IsString()
    @IsOptional() // Rule: This field is allowed to be missing
    description?: string;
}