import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Logger, Post, Req, Res, UseGuards } from '@nestjs/common';

import { B2CDto } from './dto/b2c.dto';
import { TransactionStatusDto } from './dto/transaction-status.dto';
import { Response, Request } from 'express';
import { MpesaService } from './mpesa.service';
import { VerifiedAuthGuard } from 'src/core/guards/verified.auth.guard';


@Controller('mpesa')
export class MpesaController {
  private readonly logger = new Logger(MpesaController.name);
  constructor(private readonly mpesaService: MpesaService) { }

  // -----------------------------------------------------
  // 💳 1. STK Push (C2B)
  // -----------------------------------------------------
  @UseGuards(VerifiedAuthGuard)
  @Post('stk-push')
  async stkPush(@Req() req: any, @Body() dto: { amount: number }) {
    const user = req.user;
    if (!user.phoneNumber) {
      throw new BadRequestException('You must have a phone number in your profile to top up.');
    }
    this.logger.log(`STK Push initiated by user: ${user._id} for amount: ${dto.amount}`);
    const result = await this.mpesaService.initiateStkPush({
      userId: user._id.toString(),
      phone: user.phoneNumber,
      amount: dto.amount,
      accountReference: user._id.toString(),
      transactionDesc: 'Wallet Top-up'
    });

    return {
      message: 'STK Push initiated successfully. Please check your phone.',
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
  async callback(@Body() callbackData: any) {
    this.mpesaService.handleCallback(callbackData);
    return { message: 'Callback received' };
  }
  // @Post('callback')
  // @HttpCode(HttpStatus.OK)
  // async callback(@Req() req: Request, @Res() res: Response) {
  //   try {
  //     await this.mpesaService.handleCallback(req.body);
  //     this.logger.log('M-Pesa callback processed successfully');
  //     return res.status(200).json({ message: 'Callback received successfully' });
  //   } catch (error) {
  //     this.logger.error('Callback processing failed', error);
  //     return res.status(500).json({ message: 'Callback processing failed' });
  //   }
  // }
}
