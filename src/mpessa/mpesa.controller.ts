// src/mpesa/mpesa.controller.ts

import { Body, Controller, HttpCode, HttpStatus, Logger, Post, Req, Res } from '@nestjs/common';

import { StkPushDto } from './dto/stk-push.dto';
import { B2CDto } from './dto/b2c.dto';
import { TransactionStatusDto } from './dto/transaction-status.dto';
import { Response, Request } from 'express';
import { MpesaService } from './mpesa.service';

@Controller('mpesa')
export class MpesaController {
  private readonly logger = new Logger(MpesaController.name);
  constructor(private readonly mpesaService: MpesaService) {}

  // -----------------------------------------------------
  // 💳 1. STK Push (C2B)
  // -----------------------------------------------------
  @Post('stk-push')
  @HttpCode(HttpStatus.OK)
  async stkPush(@Body() dto: StkPushDto) {
    this.logger.log(`STK Push request for phone: ${dto.phone}`);
    const result = await this.mpesaService.initiateStkPush(dto);
    return {
      message: 'STK Push initiated successfully',
      data: result,
    };
  }

  // -----------------------------------------------------
  // 💰 2. B2C Payment (Business to Customer)
  // -----------------------------------------------------
  @Post('b2c')
  @HttpCode(HttpStatus.OK)
  async b2c(@Body() dto: B2CDto) {
    // NOTE: B2C logic can be added to mpesaService next (similar to stkPush)
    // For now, just placeholder response
    return {
      message: 'B2C payout endpoint (to be implemented next)',
      payload: dto,
    };
  }

  // -----------------------------------------------------
  // 🔍 3. Transaction Status Check
  // -----------------------------------------------------
  @Post('transaction-status')
  @HttpCode(HttpStatus.OK)
  async checkTransactionStatus(@Body() dto: TransactionStatusDto) {
    // Future: Call M-Pesa TransactionStatus API endpoint
    return {
      message: 'Transaction status check endpoint (to be implemented next)',
      transactionID: dto.transactionID,
    };
  }

  // -----------------------------------------------------
  // 📞 4. M-Pesa Callback (from Safaricom)
  // -----------------------------------------------------
  @Post('callback')
  @HttpCode(HttpStatus.OK)
  async callback(@Req() req: Request, @Res() res: Response) {
    try {
      await this.mpesaService.handleCallback(req.body);
      this.logger.log('M-Pesa callback processed successfully');
      return res.status(200).json({ message: 'Callback received successfully' });
    } catch (error) {
      this.logger.error('Callback processing failed', error);
      return res.status(500).json({ message: 'Callback processing failed' });
    }
  }
}
