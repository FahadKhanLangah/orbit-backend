import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
} from "@nestjs/common";
import { V1Controller } from "src/core/common/v1-controller.decorator";
import { VerifiedAuthGuard } from "src/core/guards/verified.auth.guard";
import { AdService } from "./ad.service";
import { CreateAdDto } from "./dto/create-ad.dto";
import { resOK } from "src/core/utils/res.helpers";
import { FileInterceptor } from "@nestjs/platform-express";

@V1Controller("ads")
export class AdController {
  constructor(private readonly adService: AdService) {}

  @UseGuards(VerifiedAuthGuard)
  @Get("/config")
  async getAdConfig() {
    return resOK(await this.adService.getAdConfig());
  }
  @UseGuards(VerifiedAuthGuard)
  @Get("/active")
  async getActiveAds() {
    return resOK(await this.adService.getActiveAds());
  }
  @UseGuards(VerifiedAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor("image"))
  async createAd(
    @Req() req: any,
    @Body() createAdDto: CreateAdDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const ad = await this.adService.createAd(req.user, createAdDto, file);
    return resOK(ad);
  }
}
