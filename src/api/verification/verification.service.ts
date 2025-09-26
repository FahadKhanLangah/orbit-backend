import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  VerificationRequest,
  VerificationStatus,
} from "./schema/verification-request.schema";
import { FileUploaderService } from "src/common/file_uploader/file_uploader.service";
import { Exception } from "handlebars";
import { UserService } from "../user_modules/user/user.service";
import { SettingsService } from "../setting/settings.service";
import { TransactionService } from "../transactions/transaction.service";
import { TransactionType } from "../transactions/schemas/transaction.schema";

@Injectable()
export class VerificationService {
  constructor(
    @InjectModel(VerificationRequest.name)
    private readonly verificationRequestModel: Model<VerificationRequest>,
    private readonly fileUploaderService: FileUploaderService,
    private readonly userService: UserService,
    private readonly settingService: SettingsService,
    private readonly transactionService: TransactionService
  ) {}

  async rejectRequest(requestId: string, reason: string) {
    if (!reason) {
      throw new BadRequestException("A reason is required for rejection.");
    }
    const request = await this.verificationRequestModel.findById(requestId);
    if (!request || request.status !== VerificationStatus.PENDING) {
      throw new BadRequestException(
        "Invalid request or request already processed."
      );
    }

    request.status = VerificationStatus.REJECTED;
    request.rejectionReason = reason;
    await request.save();

    return { message: "Account rejected." };
  }

  async approveVerificationProcess(requestId: string) {
    const application = await this.verificationRequestModel
      .findById(requestId)
      .populate("userId")
      .exec();

    if (!application || application.status !== VerificationStatus.PENDING) {
      throw new BadRequestException("No application is found by this");
    }

    const user = application.userId as any;
    const settings = await this.settingService.getSettings();
    const verificationFee = settings.verificationFee;
    if (user.balance < verificationFee) {
      application.status = VerificationStatus.REJECTED;
      application.rejectionReason = "Not enough funds available";
      await application.save();
      throw new BadRequestException(
        "User has insufficient balance. Application rejected."
      );
    }
    const transactionDto = {
      userId: user._id,
      amount: verificationFee,
      type: TransactionType.BLUE_BATCH_FEE,
      description: "User Bought the blue batch",
      commissionPercentage: 100,
    };
    await this.transactionService.newTransaction(transactionDto);
    await this.userService.findByIdAndUpdate(user._id, {
      $inc: { balance: -verificationFee },
      isVerified: true,
    });

    application.status = VerificationStatus.APPROVED;
    await application.save();

    return { message: "Account approved successfully." };
  }

  // async approveVerificationProcess(requestId: string) {
  //   const application = await this.verificationRequestModel
  //     .findById(requestId)
  //     .populate("userId", "_id fullName email userImage balance")
  //     .sort({ createdAt: -1 })
  //     .exec();
  //   if (!application || application.status !== VerificationStatus.PENDING) {
  //     throw new BadRequestException("No application is found by this");
  //   }
  //   const userId = application.userId._id as any;
  //   const user = await this.userService.findById(userId);
  //   const userBalance = user.balance;
  //   const setting = await this.settingService.getSettings();
  //   if (userBalance < setting.verificationFee) {
  //     application.status = VerificationStatus.REJECTED;
  //     application.rejectionReason = "Not enough funds available";
  //     application.save();
  //   }
  //   const dto = {
  //     userId,
  //     amount: userBalance,
  //     TransactionType: TransactionType.BLUE_BATCH_FEE,
  //     description: "User Bought the blue batch",
  //     commissionPercentage:100
  //   };

  //   await this.transactionService.newTransaction(dto);

  //   await this.userService.findByIdAndUpdate(userId, { isVerified: true });
  //   application.status = VerificationStatus.APPROVED;
  //   application.save();
  //   return { message: "Account approved successfully." };
  // }

  async getVerificationsApplications(status?: VerificationStatus) {
    const filter = status ? { status } : { status: VerificationStatus.PENDING };
    const applications = await this.verificationRequestModel
      .find(filter)
      .populate("userId", "fullName email userImage")
      .sort({ createdAt: -1 })
      .exec();
    return applications;
  }

  async createRequest(
    userId: string,
    idDocument: Express.Multer.File,
    selfie: Express.Multer.File
  ) {
    if (!idDocument || !selfie) {
      throw new BadRequestException(
        "Both ID document and selfie are required."
      );
    }

    const idDocumentUrl = await this.fileUploaderService.uploadVerificationDoc(
      idDocument,
      userId
    );

    const selfieUrl = await this.fileUploaderService.uploadVerificationDoc(
      selfie,
      userId
    );

    const newRequest = new this.verificationRequestModel({
      userId,
      idDocumentUrl,
      selfieUrl,
      status: VerificationStatus.PENDING,
    });
    await newRequest.save();

    const message =
      "Your verification documents have been uploaded successfully. The review process may take up to 5 business days.";

    return { message: message };
  }
}
