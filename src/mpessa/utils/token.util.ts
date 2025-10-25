import axios from 'axios';

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export const getMpesaAccessToken = async (): Promise<string> => {
  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  const env = process.env.MPESA_ENVIRONMENT || 'sandbox';
  const baseUrl =
    env === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error('Missing M-Pesa Consumer Key or Secret');
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  try {
    const response = await axios.get(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${auth}` },
    });

    cachedToken = response.data.access_token;
    tokenExpiry = now + 60 * 60 * 1000; // 1 hour

    return cachedToken;
  } catch (error) {
    console.error('Failed to get M-Pesa token:', error?.response?.data || error.message);
    throw new Error('M-Pesa token generation failed');
  }
};
