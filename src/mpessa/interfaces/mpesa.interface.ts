
export interface MpesaAuthResponse {
  access_token: string;
  expires_in: string;
}

export interface StkPushRequest {
  phone: string;
  amount: number;
  accountReference: string;
  transactionDesc?: string;
  callbackUrl?: string;
}

export interface StkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface B2CRequest {
  phone: string;
  amount: number;
  remarks?: string;
  occasion?: string;
}

export interface B2CResponse {
  ConversationID: string;
  OriginatorConversationID: string;
  ResponseDescription: string;
}

export interface TransactionStatusRequest {
  transactionID: string; // e.g. Mpesa Receipt Number
}

export interface TransactionStatusResponse {
  ConversationID: string;
  OriginatorConversationID: string;
  ResultCode: string;
  ResultDesc: string;
  ResultParameters?: Record<string, any>;
}
