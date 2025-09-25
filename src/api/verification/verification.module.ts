// src/api/verification/verification.module.ts

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { VerificationController } from "./verification.controller";
import { VerificationService } from "./verification.service";
import {
  VerificationRequest,
  VerificationRequestSchema,
} from "./schema/verification-request.schema";
import { FileUploaderModule } from "src/common/file_uploader/file_uploader.module";
import { AuthService } from "../auth/auth.service";
import { AuthModule } from "../auth/auth.module";
import { UserModule } from "../user_modules/user/user.module";
import { SettingsModule } from "../setting/settings.module";
import { TransactionService } from "../transactions/transaction.service";
import { TransactionModule } from "../transactions/transaction.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VerificationRequest.name, schema: VerificationRequestSchema },
    ]),
    FileUploaderModule,
    AuthModule,
    UserModule,
    SettingsModule,
    TransactionModule
  ],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
