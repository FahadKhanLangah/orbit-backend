import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GooglePayController } from './google-pay.controller';
import { GooglePayService } from './google-pay.service';
import { GooglePayTransaction, GooglePayTransactionSchema } from './google-pay.schema';
import { UserSchema } from 'src/api/user_modules/user/entities/user.entity'; // Adjust path to your User schema

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GooglePayTransaction.name, schema: GooglePayTransactionSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [GooglePayController],
  providers: [GooglePayService],
})
export class GooglePayModule {}