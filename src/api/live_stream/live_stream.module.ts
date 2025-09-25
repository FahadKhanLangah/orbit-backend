/**
 * Copyright 2023, the hatemragab project author.
 * All rights reserved. Use of this source code is governed by a
 * MIT license that can be found in the LICENSE file.
 */

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LiveStreamController } from "./live_stream.controller";
import { LiveStreamService } from "./live_stream.service";
import {
  LiveStreamSchema,
  LiveStreamParticipantSchema,
  LiveStreamMessageSchema,
  LiveStreamJoinRequestSchema,
} from "./schemas/live_stream.schema";
import { AgoraModule } from "../../chat/agora/agora.module";
import { SocketIoModule } from "../../chat/socket_io/socket_io.module";
import { AuthModule } from "../auth/auth.module";
import { UserModule } from "../user_modules/user/user.module";
import { NotificationEmitterModule } from "../../common/notification_emitter/notification_emitter.module";
import { UserDeviceModule } from "../user_modules/user_device/user_device.module";
import { FileUploaderModule } from "src/common/file_uploader/file_uploader.module";
import { CategoryService } from "../admin_panel/category/category.service";
import {
  Category,
  CategorySchema,
} from "../admin_panel/category/category.schema";
import { GiftModule } from "../gifts/gift.module";
import { TransactionService } from "../transactions/transaction.service";
import { TransactionSchema } from "../transactions/schemas/transaction.schema";
import { SettingsModule } from "../setting/settings.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "LiveStream", schema: LiveStreamSchema },
      { name: "LiveStreamParticipant", schema: LiveStreamParticipantSchema },
      { name: "LiveStreamMessage", schema: LiveStreamMessageSchema },
      { name: "LiveStreamJoinRequest", schema: LiveStreamJoinRequestSchema },
      { name: Category.name, schema: CategorySchema },
      { name: "Transaction", schema: TransactionSchema },
    ]),
    AgoraModule,
    SocketIoModule,
    AuthModule,
    UserModule,
    NotificationEmitterModule,
    UserDeviceModule,
    FileUploaderModule,
    GiftModule,
    SettingsModule
  ],
  controllers: [LiveStreamController],
  providers: [LiveStreamService, CategoryService, TransactionService],
  exports: [LiveStreamService],
})
export class LiveStreamModule {}
