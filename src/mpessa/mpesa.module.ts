import { Module } from '@nestjs/common';
import { MpesaController } from './mpesa.controller';
import { MpesaService } from './mpesa.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MpesaTransaction, MpesaTransactionSchema } from './schemas/mpesa.schema';
import { Commission, CommissionSchema } from './schemas/commission.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MpesaTransaction.name, schema: MpesaTransactionSchema },
      { name: Commission.name, schema: CommissionSchema }
    ]),
  ],
  controllers: [MpesaController],
  providers: [MpesaService],
  exports: [MpesaService],
})
export class MpessaModule { }
