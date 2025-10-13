
import { IsNotEmpty, IsString, Length } from 'class-validator';
import LoginDto from './login.dto';
import { PickType } from '@nestjs/mapped-types'; 

export class TwoFactorLoginDto extends PickType(LoginDto, [
  'platform',
  'ip',
  'pushKey',
  'language',
  'deviceInfo',
  'deviceId',
  'rememberMe',
] as const) {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}