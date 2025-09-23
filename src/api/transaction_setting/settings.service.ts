import { Model } from "mongoose";
import { ISettings } from "./schema/settings.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";
import { CreateSettingsDto } from "./dto/create-settings.dto";
import { UpdateSettingsDto } from "./dto/update-settings.dto";

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel("Settings") private readonly settingsModel: Model<ISettings>
  ) {}
  async create(createSettingsDto: CreateSettingsDto): Promise<ISettings> {
    const newSettings = new this.settingsModel(createSettingsDto);
    return newSettings.save();
  }

  async findOrCreate(): Promise<ISettings> {
    let settings = await this.settingsModel.findOne().exec();
    if (!settings) {
      settings = await this.settingsModel.create({});
    }
    return settings;
  }

  async findAll(): Promise<ISettings[]> {
    return this.settingsModel.find().exec();
  }

  async getSettings(): Promise<ISettings> {
    let settings = await this.settingsModel.findOne().exec();
    // If no settings doc exists yet, create one with defaults
    if (!settings) {
      settings = await this.settingsModel.create({});
    }
    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto): Promise<ISettings> {
    const settings = await this.getSettings();
    return this.settingsModel.findByIdAndUpdate(settings._id, dto, {
      new: true,
    });
  }
}
