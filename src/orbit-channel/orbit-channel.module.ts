import { Module } from "@nestjs/common";
import { OrbitChannelController } from "./orbit-channel.controller";
import { OrbitChannelService } from "./orbit-channel.service";
import { AuthModule } from "src/api/auth/auth.module";
import { MongooseModule } from "@nestjs/mongoose";
import { OrbitChannelSchema } from "./entities/orbit-channel.entity";
import { ChannelMemberSchema } from "./entities/channel-member.entity";
import { FileUploaderModule } from "src/common/file_uploader/file_uploader.module";

@Module({
  imports: [
    AuthModule,
    FileUploaderModule,
    MongooseModule.forFeature([
      { name: "OrbitChannel", schema: OrbitChannelSchema },
      { name: "ChannelMember", schema: ChannelMemberSchema },
    ]),
  ],
  controllers: [OrbitChannelController],
  providers: [OrbitChannelService],
})
export class OrbitChannelModule {}
