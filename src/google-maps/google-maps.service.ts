import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Client,
  DistanceMatrixRequest,
  TravelMode,
} from '@googlemaps/google-maps-services-js';

@Injectable()
export class GoogleMapsService {
  private readonly client: Client;

  constructor(private readonly configService: ConfigService) {
    this.client = new Client({});
  }

  async getDistanceAndDuration(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number },
  ): Promise<{ distance: number; duration: number }> {
    const request: DistanceMatrixRequest = {
      params: {
        origins: [{ lat: origin.latitude, lng: origin.longitude }],
        destinations: [{ lat: destination.latitude, lng: destination.longitude }],
        mode: TravelMode.driving,
        key: process.env.GOOGLE_CLOUD_API_KEY || this.configService.get<string>('GOOGLE_CLOUD_API_KEY'),
      },
    };

    try {
      const response = await this.client.distancematrix(request);
      const element = response.data.rows[0].elements[0];

      if (element.status === 'OK') {
        return {
          distance: element.distance.value, // Distance in meters
          duration: element.duration.value, // Duration in seconds
        };
      } else {
        throw new Error('Could not calculate route details.');
      }
    } catch (error) {
      console.error('Google Maps API Error:', error);
      throw new Error('Failed to connect to Google Maps service.');
    }
  }
}
