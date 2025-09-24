import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  VerificationRequest,
  VerificationStatus,
} from "./schema/verification-request.schema";
import { FileUploaderService } from "src/common/file_uploader/file_uploader.service";

@Injectable()
export class VerificationService {
  constructor(
    @InjectModel(VerificationRequest.name)
    private readonly verificationRequestModel: Model<VerificationRequest>,
    private readonly fileUploaderService: FileUploaderService
  ) {}

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
