import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaystackController } from './paystack.controller';
import { PaystackService } from './paystack.service';
import { UserSchema } from 'src/api/user_modules/user/entities/user.entity';
import { PaystackTransactionSchema } from 'src/wallet/entity/transaction.entity';
import { AuthModule } from 'src/api/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'PaystackTransaction', schema: PaystackTransactionSchema },
      { name: 'User', schema: UserSchema }
    ]),
    AuthModule
  ],
  controllers: [PaystackController],
  providers: [PaystackService],
  exports: [PaystackService]
})
export class PaystackModule { }