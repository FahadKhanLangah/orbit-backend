import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DownloadRideFormat, IRide, PaymentMethod, RideStatus } from './entity/ride.entity';
import { IUser } from 'src/api/user_modules/user/entities/user.entity';
import { CreateRideDto } from './dto/create-ride.dto';
import { IVehicle, VehicleCategory } from '../vehicle/entity/vehicle.entity';
import { GetFareEstimateDto } from './dto/get-fare-estimate.dto';
import { IDriver } from '../driver/entity/driver.entity';
import { GoogleMapsService } from 'src/google-maps/google-maps.service';
import { SocketIoService } from 'src/chat/socket_io/socket_io.service';
import { SocketEventsType } from 'src/core/utils/enums';
import { UpdateLocationDto } from '../driver/dto/update-location.dto';
import { RidePointSetting } from './entity/ride-points.entity';
import PDFDocument from 'pdfkit';
import { Parser, Transform } from 'json2csv';
import { PassThrough } from 'stream';
import { RateRideDto } from './dto/rate_ride.dto';


const PRICING_CONFIG = {
  baseFare: 150,
  perKmRate: {
    [VehicleCategory.Economy]: 30,
    [VehicleCategory.OrbitComfort]: 45,
    [VehicleCategory.OrbitXL]: 60,
    [VehicleCategory.OrbitGreen]: 40,
  },
  systemCommissionRate: 0.15,
  perMinuteRate: 5,
  multipliers: {
    night: { startHour: 22, endHour: 6, rate: 1.4 },
    weather: { bad: 1.3, normal: 1.0 },
    roadCondition: { poor: 1.15, good: 1.0 },
  },
  adjustments: {
    fuelType: { Electric: -10, Fuel: 0 },
  },
};

@Injectable()
export class RidesService {
  constructor(
    @InjectModel('Ride') private readonly rideModel: Model<IRide>,
    @InjectModel('Driver') private readonly driverModel: Model<IDriver>,
    @InjectModel('Vehicle') private readonly vehicleModel: Model<IVehicle>,
    @InjectModel('User') private readonly userModel: Model<IUser>,
    @InjectModel(RidePointSetting.name) private readonly loyaltySettingModel: Model<RidePointSetting>,
    private readonly googleMapsService: GoogleMapsService,
    private readonly socketIoService: SocketIoService
  ) { }

  async requestRide(user: IUser, createRideDto: CreateRideDto): Promise<IRide> {
    const activeRide = await this.rideModel.findOne({
      userId: user._id,
      status: {
        $in: [
          RideStatus.Pending,
          RideStatus.Accepted,
          RideStatus.InProgress,
          RideStatus.Scheduled
        ],
      },
    });

    if (activeRide) {
      throw new ConflictException('You already have an active ride request.');
    }
    const estimatedFareData = await this.getFareEstimate({
      pickup: createRideDto.pickup,
      destination: createRideDto.destination,
      category: createRideDto.category,
    });

    const estimatedFare = estimatedFareData.totalFare;
    const systemCommission = estimatedFare * PRICING_CONFIG.systemCommissionRate;
    const newRide = new this.rideModel({
      userId: user._id,
      pickup: createRideDto.pickup,
      destination: createRideDto.destination,
      paymentMethod: createRideDto.paymentMethod,
      category: createRideDto.category,
      estimatedFare: estimatedFare,
      systemCommission: systemCommission,
      status: createRideDto.scheduledTime ? RideStatus.Scheduled : RideStatus.Pending,
      scheduledTime: createRideDto.scheduledTime ? createRideDto.scheduledTime : null,
    });

    await newRide.save();
    this.findNearbyDriversAndNotify(newRide);
    return newRide;
  }

  async acceptRide(driverUser: IUser, rideId: string, vehicleId: string): Promise<IRide> {
    const driver = await this.driverModel.findOne({ userId: driverUser._id });
    if (!driver) {
      throw new ForbiddenException('You are not a registered driver.');
    }
    const ride = await this.rideModel.findById(rideId);
    if (!ride) {
      throw new NotFoundException('Ride not found.');
    }
    if (ride.status !== RideStatus.Pending) {
      throw new ConflictException('This ride is no longer available.');
    }

    ride.driverId = driver._id;
    ride.vehicleId = vehicleId;
    ride.status = RideStatus.Accepted;

    this.socketIoService.io.to(ride.userId.toString()).emit(
      SocketEventsType.v1RideAccepted,
      JSON.stringify({ rideId: ride._id, driverId: driver._id })
    );
    return await ride.save();
  }

  async findNearbyDriversAndNotify(ride: IRide) {
    const vehicles = await this.vehicleModel.find({ category: ride.category, isActive: true }).select('driverId').exec();
    const driverIdsWithMatchingVehicle = vehicles.map(v => v.driverId);
    const nearbyDrivers = await this.driverModel.find({
      _id: { $in: driverIdsWithMatchingVehicle },
      status: 'online',
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [ride.pickup.longitude, ride.pickup.latitude],
          },
          $maxDistance: 5000,
        },
      },
    }).populate('userId', 'balance').limit(10).exec();
    if (nearbyDrivers.length > 0) {
      for (const driver of nearbyDrivers) {
        this.socketIoService.io.to(driver.userId.toString()).emit(
          SocketEventsType.v1RideRequested,
          JSON.stringify({
            rideId: ride._id.toString(),
            pickup: ride.pickup,
            destination: ride.destination,
            category: ride.category,
            date: new Date(),
          }),
        );
      }
    } else {
      console.log("No nearby drivers found for ride request.");
      await this.rideModel.findByIdAndUpdate(ride._id, { status: RideStatus.NoDriversAvailable });
      this.socketIoService.io.to(ride.userId.toString()).emit(
        SocketEventsType.v1RideRequested,
        JSON.stringify({
          rideId: ride._id.toString(),
          status: RideStatus.NoDriversAvailable,
          date: new Date(),
        }),
      );
    }
    return nearbyDrivers;
  }

  async startRide(driverUser: IUser, rideId: string): Promise<IRide> {
    const ride = await this._findAndAuthorizeRideForDriver(driverUser, rideId);
    if (ride.status !== RideStatus.Accepted) {
      throw new ConflictException(`Cannot start a ride with status "${ride.status}".`);
    }
    const commissionToDeduct = ride.systemCommission;
    if (driverUser.balance < commissionToDeduct) {
      console.error(`User ${driverUser._id} balance is too low to start ride ${ride._id}`);
      throw new ConflictException('Your wallet balance is too low to start this ride. Please top up.');
    }
    await this.userModel.updateOne(
      { _id: driverUser._id },
      { $inc: { balance: -commissionToDeduct } }
    );
    ride.status = RideStatus.InProgress;
    ride.startedAt = new Date();
    await ride.save();
    return ride;
  }

  async completeRide(driverUser: IUser, rideId: string): Promise<IRide> {
    const ride = await this._findAndAuthorizeRideForDriver(driverUser, rideId);
    if (ride.status !== RideStatus.InProgress) {
      throw new ConflictException(`Cannot complete a ride with status "${ride.status}".`);
    }
    const routeDetails = await this.googleMapsService.getDistanceAndDuration(ride.pickup, ride.destination);
    const fareDetails = await this.getFareEstimate({
      pickup: ride.pickup,
      destination: ride.destination,
      category: ride.category
    });

    ride.status = RideStatus.Completed;
    ride.completedAt = new Date();
    ride.distance = routeDetails.distance;
    ride.duration = routeDetails.duration;
    ride.fare = fareDetails.totalFare;
    ride.fareBreakdown = fareDetails.breakdown;

    const rider = await this.userModel.findById(ride.userId);
    if (!rider) {
      throw new NotFoundException('Rider user not found.');
    }
    const userDriver = await this.userModel.findById(driverUser._id);
    if (!userDriver) {
      throw new NotFoundException('Driver user not found.');
    }

    // Update driver earnings

    const driverEarnings = ride.fare - ride.systemCommission;
    if (ride.paymentMethod === PaymentMethod.Online) {
      userDriver.balance += driverEarnings;
      rider.balance -= ride.fare;
    }
    if (ride.paymentMethod === PaymentMethod.Points) {
      userDriver.balance += driverEarnings;
      rider.ridePoints -= fareDetails.totalFareInPoints;
    }
    await this.driverModel.findOneAndUpdate(
      { userId: driverUser._id },
      { $inc: { totalRides: 1 } }
    )
    await rider.save();
    await userDriver.save();

    return await ride.save();
  }

  async findActiveRideForDriver(driverUser: IUser): Promise<IRide | null> {
    const driver = await this.driverModel.findOne({ userId: driverUser._id });
    if (!driver) {
      throw new ForbiddenException('You are not a registered driver.');
    }
    const activeRide = await this.rideModel.findOne({
      driverId: driver._id,
      status: {
        $in: [
          RideStatus.Accepted,
          RideStatus.InProgress,
        ],
      },
    });

    return activeRide;
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

  async getFareEstimate(dto: GetFareEstimateDto) {
    const routeDetails = await this.googleMapsService.getDistanceAndDuration(
      dto.pickup,
      dto.destination,
    );
    const distanceInKm = routeDetails.distance / 1000;
    const durationInMinutes = routeDetails.duration / 60;
    const weatherCondition = await this.getWeatherCondition(dto.pickup); // 'bad' or 'normal'
    const roadCondition = await this.getRoadCondition(dto.pickup, dto.destination); // 'poor' or 'good'

    const baseFare = PRICING_CONFIG.baseFare;
    const distanceFare = distanceInKm * PRICING_CONFIG.perKmRate[dto.category];
    const timeFare = durationInMinutes * PRICING_CONFIG.perMinuteRate;

    const nightMultiplier = this.getNightMultiplier();
    const weatherMultiplier = PRICING_CONFIG.multipliers.weather[weatherCondition];
    const roadConditionMultiplier = PRICING_CONFIG.multipliers.roadCondition[roadCondition];

    const fuelType = (dto.category === VehicleCategory.OrbitGreen) ? 'Electric' : 'Fuel';
    const fuelTypeAdjustment = PRICING_CONFIG.adjustments.fuelType[fuelType];

    const subtotal = baseFare + distanceFare + timeFare;
    const finalFare = (subtotal * nightMultiplier * weatherMultiplier * roadConditionMultiplier) + fuelTypeAdjustment;
    const pointRide = await this.loyaltySettingModel.findOne();
    const totalFareInPoints = finalFare * (pointRide?.pointsToCurrencyRate || 10);
    return {
      totalFare: Math.ceil(finalFare / 5) * 5,
      totalFareInPoints,
      breakdown: {
        baseFare: baseFare,
        distanceFare: parseFloat(distanceFare.toFixed(2)),
        timeFare: parseFloat(timeFare.toFixed(2)),
        nightMultiplier: nightMultiplier,
        weatherMultiplier: weatherMultiplier,
        roadConditionMultiplier: roadConditionMultiplier,
        fuelTypeAdjustment: fuelTypeAdjustment,
      },
      route: {
        distance: `${distanceInKm.toFixed(2)} km`,
        duration: `${Math.round(durationInMinutes)} mins`,
      },
    };

  }

  async getRidesByUser(user: IUser): Promise<IRide[]> {
    const ride = this.rideModel.find({ userId: user._id }).sort({ createdAt: -1 }).exec();
    if (!ride) {
      throw new NotFoundException("No rides found for you");
    }
    return ride;
  }

  async cancelRide(user: IUser, rideId: string): Promise<IRide> {
    const ride = await this.rideModel.findOne({ _id: rideId, userId: user._id });
    if (!ride) {
      throw new NotFoundException('Ride not found.');
    }
    if (ride.status !== RideStatus.Pending && ride.status !== RideStatus.Accepted) {
      throw new ConflictException(`Cannot cancel a ride with status "${ride.status}".`);
    }
    ride.status = RideStatus.Cancelled;
    await ride.save();

    if (ride.driverId) {
      const driver = await this.driverModel.findById(ride.driverId);
      if (driver) {
        this.socketIoService.io.to(driver.userId.toString()).emit(
          SocketEventsType.v1RideCancelledByDriver,
          JSON.stringify({ rideId: ride._id })
        );
      }
    }

    return ride;
  }

  private async _findAndAuthorizeRideForDriver(driverUser: IUser, rideId: string): Promise<IRide> {
    const driver = await this.driverModel.findOne({ userId: driverUser._id });
    if (!driver) {
      throw new ForbiddenException('You are not a registered driver.');
    }

    const ride = await this.rideModel.findById(rideId);
    if (!ride) {
      throw new NotFoundException('Ride not found.');
    }

    if (ride.driverId.toString() !== driver._id.toString()) {
      throw new ForbiddenException('You are not authorized to modify this ride.');
    }

    return ride;
  }

  private getNightMultiplier(): number {
    const now = new Date();
    const currentHour = now.getHours();
    const { startHour, endHour, rate } = PRICING_CONFIG.multipliers.night;

    if (currentHour >= startHour || currentHour < endHour) {
      return rate;
    }
    return 1.0;
  }

  private async getWeatherCondition(location: any): Promise<'bad' | 'normal'> {
    console.log(`Fetching weather for ${location.latitude}`);
    // MOCK: In a real app, call a weather API (e.g., OpenWeatherMap).
    return 'normal'; // or 'bad'
  }

  private async getRoadCondition(pickup: any, destination: any): Promise<'poor' | 'good'> {
    console.log(`Fetching road conditions for route...`);
    // MOCK: This is complex. It could be based on predefined zones.
    return 'good'; // or 'poor'
  }

  async generateRidesHistory(userId: string, format: string): Promise<Buffer | PassThrough> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const rides = await this.rideModel.find({ userId })
      .populate<{ driverId: IDriver & { userId: IUser } }>({
        path: 'driverId',
        populate: {
          path: 'userId',
          select: 'fullName', // Select the fields you need from the User model
        },
      })
      .populate<{ vehicleId: IVehicle }>('vehicleId')
      .sort({ createdAt: -1 }) // Sort by most recent
      .exec();

    if (rides.length === 0) {
      throw new NotFoundException('No ride history found for this user.');
    }

    if (format === DownloadRideFormat.PDF) {
      return this._generatePdfStream(user, rides as unknown as (IRide & { driverId: IDriver & { userId: IUser }, vehicleId: IVehicle })[]);
    } else {
      return this._generateCsvStream(rides as unknown as IRide[]);
    }
  }

  private _generatePdfStream(user: IUser, rides: (IRide & { driverId: IDriver & { userId: IUser }, vehicleId: IVehicle })[]): PassThrough {
    const doc = new PDFDocument({ margin: 50 });
    const stream = new PassThrough();
    doc.pipe(stream);

    // --- PDF Header ---
    doc.fontSize(20).font('Helvetica-Bold').text('Ride History Report', { align: 'center' });
    doc.fontSize(14).font('Helvetica').text(`For: ${user.fullName}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Report generated on: ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}`, { align: 'center' });
    doc.moveDown(2);

    // --- PDF Body (Loop through rides) ---
    rides.forEach(ride => {
      const rideDate = ride.createdAt.toLocaleDateString('en-US');

      doc.fontSize(12).font('Helvetica-Bold').text(`Ride on ${rideDate} - Status: ${ride.status.toUpperCase()}`);
      doc.lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(0.5);

      doc.font('Helvetica').text(`From: ${ride.pickup.address}`);
      doc.text(`To: ${ride.destination.address}`);
      doc.moveDown(0.5);

      const driverName = ride.driverId?.userId?.fullName || 'N/A';
      const vehicle = ride.vehicleId ? `${ride.vehicleId.model} (${ride.vehicleId.numberPlate})` : 'N/A';

      doc.text(`Fare: ${ride.fare?.toFixed(2) || 'N/A'} PKR`, { continued: true });
      doc.text(` | Driver: ${driverName}`, { continued: true });
      doc.text(` | Vehicle: ${vehicle}`);
      doc.moveDown(2);
    });

    doc.end();
    return stream;
  }

  private _generateCsvStream(rides: IRide[]): PassThrough {
    const stream = new PassThrough();

    const fields = [
      { label: 'Ride ID', value: '_id' },
      { label: 'Date', value: (row) => new Date(row.createdAt).toISOString() },
      { label: 'Status', value: 'status' },
      { label: 'Pickup Address', value: 'pickup.address' },
      { label: 'Destination Address', value: 'destination.address' },
      { label: 'Fare ', value: (row) => row.fare?.toFixed(2) || 'N/A' },
      { label: 'Payment Method', value: 'paymentMethod' },
      // Safely access nested data using a function
      { label: 'Driver Name', value: (row) => (row.driverId as any)?.userId?.fullName || 'N/A' },
      { label: 'Vehicle Model', value: (row) => (row.vehicleId as IVehicle)?.model || 'N/A' },
      { label: 'Vehicle Number Plate', value: (row) => (row.vehicleId as IVehicle)?.numberPlate || 'N/A' },
    ];

    const transformOpts: import('stream').TransformOptions = { highWaterMark: 16384, encoding: 'utf8' };
    const json2csv = new Transform({ fields }, transformOpts);

    // Pipe the transform to your passthrough stream
    const processor = json2csv.pipe(stream);

    // Push each ride into the transform
    for (const ride of rides) {
      json2csv.write(ride.toObject());
    }
    json2csv.end();

    return stream;
  }

  async rateRide(userId, rideId: string, rideRideDto: RateRideDto): Promise<IRide> {
    const rating = rideRideDto.rating;
    const comment = rideRideDto.comment;
    const ride = await this.rideModel.findById(rideId);
    if (!ride) {
      throw new NotFoundException('Ride not found.');
    }
    if (ride.status !== RideStatus.Completed) {
      throw new ConflictException('Can only rate a driver for a completed ride.');
    }
    if (ride.userId.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to rate this ride.');
    }
    ride.rating = rating;
    if (comment) {
      ride.ratingComment = comment;
    }
    await ride.save();
    const driver = await this.driverModel.findById(ride.driverId)
    driver.rating = ((driver.rating * driver.totalRides) + rating) / (driver.totalRides + 1);
    await driver.save();
    return ride;
  }

  async redeemPoints(userId, rideId) {
    const ride = await this.rideModel.findById(rideId);
    if (!ride) {
      throw new NotFoundException('Ride not found.');
    }
    if (ride.userId.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to redeem this ride.');
    }
    if (ride.status !== RideStatus.Completed) {
      throw new ConflictException('Can not redeem points for uncompleted Ride.');
    }
    if (ride.isPointsRedeemed) {
      throw new ConflictException('Points have already been redeemed for this ride.');
    }
    ride.isPointsRedeemed = true;
    const ridePointsSetting = await this.loyaltySettingModel.findOne();
    console.log(ridePointsSetting.pointsPerRide)
    await this.userModel.findByIdAndUpdate(userId,
      { $inc: { ridePoints: ridePointsSetting.pointsPerRide } }
    )
    await ride.save();
    return "Points Redeemed successfully"
  }

  async getLoyaltySettings(): Promise<RidePointSetting> {
    const settings = await this.loyaltySettingModel.findOne({ isActive: true });
    if (!settings) {
      throw new NotFoundException('Loyalty settings not found.');
    }
    return settings;
  }

  async updateLoyaltySettings(updateData: Partial<RidePointSetting>): Promise<RidePointSetting> {
    const settings = await this.loyaltySettingModel.findOneAndUpdate(
      { isActive: true },
      updateData,
      { new: true }
    );
    if (!settings) {
      throw new NotFoundException('Loyalty settings not found.');
    }
    return settings;
  }

}
