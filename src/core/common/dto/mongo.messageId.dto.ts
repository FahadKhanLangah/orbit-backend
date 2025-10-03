import CommonDto from "./common.dto";
import { IsMongoId } from "class-validator";

export class MongoMessageIdDto extends CommonDto {
  @IsMongoId()
  messageId: string;
}
