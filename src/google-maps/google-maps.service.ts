import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

interface Location {
  latitude: number;
  longitude: number;
}

@Injectable()
export class GoogleMapsService {
  private readonly apiUrl = 'https://routes.googleapis.com/directions/v2:computeRoutes';
  private readonly apiKey = process.env.GOOGLE_CLOUD_API_KEY;

  // Directional Api
  // async getDistanceAndDuration(origin: Location, destination: Location) {
  //   try {
  //     const url = `https://maps.googleapis.com/maps/api/directions/json`;

  //     const response = await axios.get(url, {
  //       params: {
  //         origin: `${origin.latitude},${origin.longitude}`,
  //         destination: `${destination.latitude},${destination.longitude}`,
  //         mode: 'driving',
  //         key: this.apiKey,
  //       },
  //     });

  //     if (response.data.status !== 'OK') {
  //       throw new InternalServerErrorException(
  //         `Directions API error: ${response.data.status}`
  //       );
  //     }

  //     const route = response.data.routes?.[0];
  //     const leg = route?.legs?.[0];

  //     if (!leg) {
  //       throw new InternalServerErrorException('No route found');
  //     }

  //     return {
  //       distance: leg.distance.value,
  //       duration: leg.duration.value,
  //       polyline: route.overview_polyline?.points,
  //     };
  //   } catch (error) {
  //     console.error('Directions API error:', error.response?.data || error.message);
  //     throw new InternalServerErrorException('Failed to get distance/duration');
  //   }
  // }

  // Routes Api
  async getDistanceAndDuration(origin: Location, destination: Location) {
    try {
      const body = {
        origin: {
          location: {
            latLng: {
              latitude: origin.latitude,
              longitude: origin.longitude,
            },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: destination.latitude,
              longitude: destination.longitude,
            },
          },
        },
        travelMode: 'DRIVE',
        computeAlternativeRoutes: false,
        routeModifiers: {
          avoidTolls: false,
          avoidHighways: false,
          avoidFerries: false,
        },
        languageCode: 'en-US',
        units: 'METRIC',
      };

      const response = await axios.post(this.apiUrl, body, {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey!,
          'X-Goog-FieldMask':
            'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline',
        },
      });

      const route = response.data.routes?.[0];
      if (!route) {
        throw new InternalServerErrorException('No route found');
      }

      return {
        distance: route.distanceMeters, // in meters
        duration: this.parseDuration(route.duration), // in seconds
        polyline: route.polyline?.encodedPolyline, // optional
      };
    } catch (error) {
      console.error(
        'Google Routes API error:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException('Failed to get distance/duration from Google Routes API');
    }
  }

  private parseDuration(durationString: string): number {
    return parseInt(durationString.replace('s', ''), 10);
  }

}

/*
async getDistanceAndDuration(origin: Location, destination: Location) {
    return {
      distance: 2000,
      duration: 200
    }
  }
*/