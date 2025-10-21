import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IVehicle } from './entity/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { FileUploaderService } from 'src/common/file_uploader/file_uploader.service';
import { IUser } from 'src/api/user_modules/user/entities/user.entity';
import { IDriver } from '../driver/entity/driver.entity';
import { UpdateVehicleChargesDto } from './dto/update-vehicle-charges.dto';

@Injectable()
export class VehicleService {
  constructor(
    @InjectModel('Vehicle') private readonly vehicleModel: Model<IVehicle>,
    @InjectModel('Driver') private readonly driverModel: Model<IDriver>,
    private readonly uploaderService: FileUploaderService
  ) { }
  async createVehicle(
    user: IUser,
    createVehicleDto: CreateVehicleDto,
    vehicleImage: Express.Multer.File,
  ): Promise<IVehicle> {
    const driver = await this.driverModel.findOne({ userId: user._id }).exec();

    if (!driver) {
      throw new NotFoundException(`Driver profile not found for user ${user._id}. Please create a driver profile first.`);
    }

    if (!vehicleImage) {
      throw new BadRequestException('Vehicle image is required.');
    }
    const imageUrl = await this.uploaderService.uploadVerificationDoc(vehicleImage, driver._id.toString());

    const newVehicleData = {
      ...createVehicleDto,
      driverId: driver._id,
      image: imageUrl,
    };

    const newVehicle = await this.vehicleModel.create(newVehicleData);
    return newVehicle;
  }

  async getAvailableVehicles(filter: any): Promise<IVehicle[]> {
    return this.vehicleModel
      .find(filter)
      .populate({
        path: 'driverId',
        select: 'status rating totalRides userId',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'fullName latitude longitude  locationUpdatedAt userImage',
        },
      })
      .exec();
  }

  async getMyVehicles(userId: string) {
    const driver = await this.driverModel.findOne({ userId }).exec();
    if (!driver) {
      throw new NotFoundException(`Driver profile not found for user ${userId}.`);
    }
    const driverId = driver._id;
    return this.vehicleModel.find({ driverId: driverId });
  }

 async updateMyVehicleCharges(
    user: IUser,
    vehicleId: string,
    updateChargesDto: UpdateVehicleChargesDto,
  ): Promise<IVehicle> {
    const driver = await this.driverModel.findOne({ userId: user._id }).exec();

    if (!driver) {
      throw new ForbiddenException('You do not have a driver profile.');
    }
    const vehicle = await this.vehicleModel.findOne({
      _id: vehicleId,
      driverId: driver._id,
    }).exec();
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID "${vehicleId}" not found or you do not have permission to edit it.`);
    }
    if (updateChargesDto.chargesPerKm !== undefined) {
      vehicle.rideRates.chargesPerKm = updateChargesDto.chargesPerKm;
    }

    if (updateChargesDto.chargesPerMinute !== undefined) {
      vehicle.rideRates.chargesPerMinute = updateChargesDto.chargesPerMinute;
    }
    return await vehicle.save();
  }
}
