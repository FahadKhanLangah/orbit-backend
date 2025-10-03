import { IsNotEmpty, IsString } from 'class-validator';
import CommonDto from 'src/core/common/dto/common.dto';


export class VoteOnPollDto extends CommonDto {
    @IsNotEmpty()
    @IsString()
    messageId: string; 

    @IsNotEmpty()
    @IsString()
    optionText: string; 
}