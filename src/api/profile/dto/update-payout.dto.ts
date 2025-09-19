import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { IUser } from "src/api/user_modules/user/entities/user.entity";
import { payoutType } from "src/core/utils/enums";

export class UpdateMyPayoutDto {
  myUser: IUser;

  @IsNotEmpty()
  @IsEnum(payoutType)
  method: payoutType;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
