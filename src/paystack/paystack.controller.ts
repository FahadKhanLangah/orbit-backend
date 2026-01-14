import { Controller, Post, Body, Req, Headers, BadRequestException, UseGuards } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import * as crypto from 'crypto';
import { VerifiedAuthGuard } from 'src/core/guards/verified.auth.guard';

@UseGuards(VerifiedAuthGuard)
@Controller('paystack/payment')
export class PaystackController {
  constructor(private readonly paystackService: PaystackService) { }

  // 1. Frontend calls this when user clicks "Top Up"
  @Post('deposit')
  async deposit(@Req() req, @Body('amount') amount: number) {
    const user = req.user; 
    return this.paystackService.initializeTopUp(user._id, user.email, amount);
  }

  // 2. Frontend calls this to Cash Out
  @Post('withdraw')
  async withdraw(
    @Req() req,
    @Body() body: { amount: number, accountNumber: string, bankCode: string, name: string }
  ) {
    // A. Create Recipient first (or reuse if you store them)
    const recipientCode = await this.paystackService.createRecipient(
      body.name, body.accountNumber, body.bankCode
    );

    // B. Process Withdrawal
    return this.paystackService.withdrawFunds(req.user._id, body.amount, recipientCode);
  }

  // 3. Paystack calls this (Not the User)
  @Post('webhook')
  async webhook(@Headers('x-paystack-signature') signature: string, @Body() body: any) {
    // Security: Verify the signature comes from Paystack
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(body))
      .digest('hex');

    if (hash !== signature) {
      throw new BadRequestException('Invalid signature');
    }

    // Process event asynchronously
    this.paystackService.handleWebhook(body);

    return { status: 'received' };
  }
}