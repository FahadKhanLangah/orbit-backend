import {
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Request,
  BadRequestException,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { VerificationService } from "./verification.service";
import { V1Controller } from "src/core/common/v1-controller.decorator";
import { VerifiedAuthGuard } from "src/core/guards/verified.auth.guard";

@V1Controller("verification")
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @UseGuards(VerifiedAuthGuard)
  @Post("/apply")
 @UseInterceptors( 
    FileFieldsInterceptor(
      [
        { name: "idDocument", maxCount: 1 },
        { name: "selfie", maxCount: 1 },
      ],
      {
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
          const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
          if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(new BadRequestException('Invalid file type. Only JPG, PNG, and PDF are allowed.'), false);
          }
        },
      },
    )
  )
  async applyForVerification(
    @Request() req,
    @UploadedFiles()
    files: {
      idDocument?: Express.Multer.File[];
      selfie?: Express.Multer.File[];
    }
  ) {
    const userId = req.user._id;
    const { idDocument, selfie } = files;

    return this.verificationService.createRequest(
      userId,
      idDocument[0],
      selfie[0]
    );
  }
}
