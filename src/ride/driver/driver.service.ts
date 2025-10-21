import { Model } from "mongoose";
import { driverProfileStatus, IDriver } from "./entity/driver.entity";
import { InjectModel } from "@nestjs/mongoose";
import { IUser } from "src/api/user_modules/user/entities/user.entity";
import { CreateDriverDto } from "./dto/create-driver.dto";
import { BadRequestException, ConflictException } from "@nestjs/common";
import { FileUploaderService } from "src/common/file_uploader/file_uploader.service";
import { MongoIdDto } from "src/core/common/dto/mongo.id.dto";
import { GetDriversFilterDto, UpdateDriverStatusDto } from "./dto/status-dto";
import { UpdateLocationDto } from "./dto/update-location.dto";

export class DriverService {
  constructor(
    @InjectModel('Driver') private readonly driverModel: Model<IDriver>,
    private readonly fileUploader: FileUploaderService
  ) { }
  // create driver profile
  async createDriverProfile(user: IUser,
    files: { [key: string]: Express.Multer.File[] },
  ): Promise<IDriver> {
    const existingDriver = await this.driverModel
      .findOne({ userId: user._id })
      .exec();
    if (existingDriver) {
      throw new ConflictException('Driver profile already exists for this user.');
    }

    if (!files || Object.keys(files).length === 0) {
      throw new BadRequestException('At least one document file is required.');
    }

    const documents: { [key: string]: string } = {};

    for (const fieldName in files) {
      const file = files[fieldName][0];
      const fileKey = await this.fileUploader.uploadVerificationDoc(
        file,
        user._id.toString(),
      );
      documents[fieldName] = fileKey;
    }

    const newDriver = new this.driverModel({
      userId: user._id,
      documents: documents,
    });

    return await newDriver.save();

  }

  async getDriverByUserId(userId: string): Promise<IDriver | null> {
    return await this.driverModel.findOne({ userId });
  }

  async getDriverById(driverId: string): Promise<IDriver | null> {
    return await this.driverModel.findById(driverId);
  }

  async updateDriverStatus(driverId, updateDriverStatus: UpdateDriverStatusDto): Promise<IDriver | null> {
    return await this.driverModel.findByIdAndUpdate(driverId, { status: updateDriverStatus.status }, { new: true });
  }

  async getAllDrivers(): Promise<IDriver[]> {
    return await this.driverModel.find();
  }

  async getSelectedDrivers(filterDto: GetDriversFilterDto): Promise<IDriver[]> {
    const { status } = filterDto;
    const query = {};
    if (status) {
      query['status'] = status;
    }
    const profiles = await this.driverModel.find(query).exec();

    return profiles;
  }

  async updateLocation(user: IUser, dto: UpdateLocationDto): Promise<IDriver> {
    return this.driverModel.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          currentLocation: {
            type: 'Point',
            coordinates: [dto.longitude, dto.latitude],
          },
        },
      },
      { new: true },
    );
  }
}