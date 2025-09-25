import { Controller, Get, Put, Body, UseGuards } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { UpdateSettingsDto } from "./dto/update-settings.dto";
import { VerifiedAuthGuard } from "src/core/guards/verified.auth.guard";
import { V1Controller } from "src/core/common/v1-controller.decorator";

@V1Controller("settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @UseGuards(VerifiedAuthGuard)
  @Get()
  async getAppSettings() {
    return this.settingsService.getSettings();
  }
}
