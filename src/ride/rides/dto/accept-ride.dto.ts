import { IsMongoId, IsNotEmpty } from 'class-validator';
export class AcceptRideDto {
  @IsNotEmpty()
  @IsMongoId()
  vehicleId: string;
}