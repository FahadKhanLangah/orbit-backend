import { IsMongoId, IsOptional, IsString } from "class-validator";
import { MongoIdDto } from "src/core/common/dto/mongo.id.dto";


export class FamilyMemberDto{
   @IsMongoId()
  userId: MongoIdDto;

  @IsOptional()
  @IsString()
  relationship: string;
}