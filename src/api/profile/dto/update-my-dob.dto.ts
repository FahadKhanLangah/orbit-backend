import { IsDateString, IsNotEmpty } from 'class-validator';
import { IUser } from 'src/api/user_modules/user/entities/user.entity';


export class UpdateMyDobDto {
  myUser: IUser;

  @IsNotEmpty()
  @IsDateString({}, { message: 'Date of birth must be a valid ISO 8601 date string (e.g., YYYY-MM-DD)' })
  dateOfBirth: Date;
}