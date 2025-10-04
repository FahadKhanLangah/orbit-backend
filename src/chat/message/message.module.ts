
import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MessageSchema } from "./entities/message.entity";
import { GroupMessageStatusModule } from "../group_message_status/group_message_status.module";
import { MessageService } from "./message.service";
import { UserModule } from "../../api/user_modules/user/user.module";
import { FileUploaderModule } from "../../common/file_uploader/file_uploader.module";
import { SocketIoModule } from "../socket_io/socket_io.module";

@Module({
  providers: [MessageService],
  imports: [
    MongooseModule.forFeature([
      {
        name: "message",
        schema: MessageSchema,
      },
    ]),
    UserModule,
    GroupMessageStatusModule,
    FileUploaderModule,
    forwardRef(() => SocketIoModule),
  ],
  exports: [MessageService],
})
export class MessageModule {}
