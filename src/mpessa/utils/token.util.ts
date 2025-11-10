import { InternalServerErrorException, Logger } from '@nestjs/common';
import axios from 'axios';

// Create a logger specific to this utility
const logger = new Logger('MpesaAccessToken');

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

const EXPIRY_BUFFER = 300000; 

export const getMpesaAccessToken = async (): Promise<string> => {
  const now = Date.now();

  if (cachedToken && tokenExpiry && now < (tokenExpiry - EXPIRY_BUFFER)) {
    logger.log('Using cached M-Pesa token.');
    return cachedToken;
  }
  if (cachedToken) {
    logger.log('M-Pesa token expired or nearing expiry. Fetching new token...');
  } else {
    logger.log('M-Pesa token not found. Fetching new token...');
  }

  const env = process.env.MPESA_ENVIRONMENT || 'sandbox';
  const baseUrl =
    env === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    logger.error('Missing M-Pesa Consumer Key or Secret. Check .env file.');
    throw new InternalServerErrorException('Missing M-Pesa Consumer Key or Secret');
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  try {
    const response = await axios.get(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${auth}` },
    });

    const data = response.data;
    cachedToken = data.access_token;

    const expiresInMs = parseInt(data.expires_in, 10) * 1000;
    tokenExpiry = now + expiresInMs; 

    logger.log('Successfully fetched and cached new M-Pesa token.');
    return cachedToken;
    
  } catch (error) {
    logger.error('Failed to get M-Pesa token:', error?.response?.data || error.message);
    throw new InternalServerErrorException('M-Pesa token generation failed');
  }
};













// import axios from 'axios';

// let cachedToken: string | null = null;
// let tokenExpiry: number | null = null;

// export const getMpesaAccessToken = async (): Promise<string> => {
//   const now = Date.now();
//   if (cachedToken && tokenExpiry && now < tokenExpiry) {
//     return cachedToken;
//   }

//   const env = process.env.MPESA_ENVIRONMENT || 'sandbox';
//   const baseUrl =
//     env === 'production'
//       ? 'https://api.safaricom.co.ke'
//       : 'https://sandbox.safaricom.co.ke';

//   const consumerKey = process.env.MPESA_CONSUMER_KEY;
//   const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

//   if (!consumerKey || !consumerSecret) {
//     throw new Error('Missing M-Pesa Consumer Key or Secret');
//   }

//   const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

//   try {
//     const response = await axios.get(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
//       headers: { Authorization: `Basic ${auth}` },
//     });

//     cachedToken = response.data.access_token;
//     tokenExpiry = now + 60 * 60 * 1000; // 1 hour

//     return cachedToken;
//   } catch (error) {
//     console.error('Failed to get M-Pesa token:', error?.response?.data || error.message);
//     throw new Error('M-Pesa token generation failed');
//   }
// };
