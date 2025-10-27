import { Module } from '@nestjs/common';
import { MpesaController } from './mpesa.controller';
import { MpesaService } from './mpesa.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MpesaTransaction, MpesaTransactionSchema } from './schemas/mpesa.schema';
import { Commission, CommissionSchema } from './schemas/commission.schema';
import { UserSchema } from 'src/api/user_modules/user/entities/user.entity';
import { AuthModule } from 'src/api/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MpesaTransaction.name, schema: MpesaTransactionSchema },
      { name: Commission.name, schema: CommissionSchema },
      { name: 'User', schema: UserSchema }
    ]),
    AuthModule
  ],
  controllers: [MpesaController],
  providers: [MpesaService],
  exports: [MpesaService],
})
export class MpessaModule { }
