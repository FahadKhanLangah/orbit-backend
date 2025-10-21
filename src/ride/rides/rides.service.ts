import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IRide, RideStatus } from './entity/ride.entity';
import { IUser } from 'src/api/user_modules/user/entities/user.entity';
import { CreateRideDto } from './dto/create-ride.dto';
import { IVehicle, VehicleCategory } from '../vehicle/entity/vehicle.entity';
import { GetFareEstimateDto } from './dto/get-fare-estimate.dto';
import { IDriver } from '../driver/entity/driver.entity';

const PRICING_CONFIG = {
  baseFare: 150,
  perKmRate: {
    [VehicleCategory.Economy]: 30,
    [VehicleCategory.OrbitComfort]: 45,
    [VehicleCategory.OrbitXL]: 60,
    [VehicleCategory.OrbitGreen]: 40,
  },
  perMinuteRate: 5,
  multipliers: {
    night: { startHour: 22, endHour: 6, rate: 1.4 }, // 10 PM to 6 AM
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
    const newRide = new this.rideModel({
      userId: user._id,
      pickup: createRideDto.pickup,
      destination: createRideDto.destination,
      paymentMethod: createRideDto.paymentMethod,
      category: createRideDto.category,
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

    // In a real app, notify the user their ride is accepted via WebSocket/push notification.

    return await ride.save();
  }

  async startRide(driverUser: IUser, rideId: string): Promise<IRide> {
    const ride = await this._findAndAuthorizeRideForDriver(driverUser, rideId);

    if (ride.status !== RideStatus.Accepted) {
      throw new ConflictException(`Cannot start a ride with status "${ride.status}".`);
    }

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

    // --- Final Fare Calculation (similar to your estimate logic) ---
    // In a real app, you'd get the *actual* distance/duration from a service.
    const routeDetails = await this.getRouteDetails(ride.pickup, ride.destination);
    const fareDetails = await this.getFareEstimate({
      pickup: ride.pickup,
      destination: ride.destination,
      category: VehicleCategory.Economy
    });

    ride.status = RideStatus.Completed;
    ride.completedAt = new Date();
    ride.distance = routeDetails.distance;
    ride.duration = routeDetails.duration;
    ride.fare = fareDetails.totalFare;
    ride.fareBreakdown = fareDetails.breakdown;

    // Here you would trigger payment logic if paymentMethod is 'Wallet' or 'Online'.

    return await ride.save();
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

  async getFareEstimate(dto: GetFareEstimateDto) {
    // STEP 1: Get Distance & Duration from an external service
    // This requires a real API call (e.g., Google Maps Distance Matrix API).
    // We will simulate the response here.
    const routeDetails = await this.getRouteDetails(dto.pickup, dto.destination);
    const distanceInKm = routeDetails.distance / 1000;
    const durationInMinutes = routeDetails.duration / 60;

    // STEP 2: Get external factors
    const weatherCondition = await this.getWeatherCondition(dto.pickup); // 'bad' or 'normal'
    const roadCondition = await this.getRoadCondition(dto.pickup, dto.destination); // 'poor' or 'good'

    // STEP 3: Calculate base fare based on distance and time
    const baseFare = PRICING_CONFIG.baseFare;
    const distanceFare = distanceInKm * PRICING_CONFIG.perKmRate[dto.category];
    const timeFare = durationInMinutes * PRICING_CONFIG.perMinuteRate;

    // STEP 4: Apply multipliers
    const nightMultiplier = this.getNightMultiplier();
    const weatherMultiplier = PRICING_CONFIG.multipliers.weather[weatherCondition];
    const roadConditionMultiplier = PRICING_CONFIG.multipliers.roadCondition[roadCondition];

    // STEP 5: Apply adjustments
    // We determine the fuel type from the vehicle category
    const fuelType = (dto.category === VehicleCategory.OrbitGreen) ? 'Electric' : 'Fuel';
    const fuelTypeAdjustment = PRICING_CONFIG.adjustments.fuelType[fuelType];

    // STEP 6: Calculate the final fare
    const subtotal = baseFare + distanceFare + timeFare;
    const finalFare = (subtotal * nightMultiplier * weatherMultiplier * roadConditionMultiplier) + fuelTypeAdjustment;

    // STEP 7: Return a detailed breakdown
    return {
      totalFare: Math.ceil(finalFare / 5) * 5, // Round to nearest 5 PKR
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

  async findNearbyDriversAndNotify(ride: IRide) {
    // 1. Find drivers who have a vehicle matching the requested category.
    const vehicles = await this.vehicleModel.find({ category: ride.category, isActive: true }).select('driverId').exec();
    const driverIdsWithMatchingVehicle = vehicles.map(v => v.driverId);

    // 2. Use a geospatial query to find the nearest available drivers.
    const nearbyDrivers = await this.driverModel.find({
      _id: { $in: driverIdsWithMatchingVehicle }, // Only drivers with the right car
      status: 'online', // Driver must be online and available
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [ride.pickup.longitude, ride.pickup.latitude],
          },
          $maxDistance: 5000, 
        },
      },
    }).limit(10).exec();

    console.log(`Found ${nearbyDrivers.length} nearby drivers for ride ${ride._id}`);
    if (nearbyDrivers.length > 0) {
      // this.eventsGateway.notifyDrivers(nearbyDrivers, ride);
      console.log('Notification would be sent via WebSockets here.');
    }
    return nearbyDrivers;
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

  private async getRouteDetails(pickup: any, destination: any): Promise<{ distance: number; duration: number }> {
    console.log(`Fetching route from ${pickup.latitude} to ${destination.latitude}`);
    // MOCK: In a real app, call Google Maps API here.
    return {
      distance: 12500, // 12.5 km in meters
      duration: 1800, // 30 minutes in seconds
    };
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
}
