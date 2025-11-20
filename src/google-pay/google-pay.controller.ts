import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { GooglePayService } from './google-pay.service';
import { ProcessGooglePayDto } from './dto/process-payment.dto';

@Controller('google-pay')
export class GooglePayController {
  constructor(private readonly googlePayService: GooglePayService) {}

  @Post('process')
  async processPayment(@Body() dto: ProcessGooglePayDto) {
    return this.googlePayService.processPayment(dto);
  }

  @Get('transactions')
  async getTransactions() {
    return this.googlePayService.getTransactions();
  }
}