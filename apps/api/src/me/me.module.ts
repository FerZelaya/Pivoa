import { Module } from '@nestjs/common';
import { BillingModule } from '../billing/billing.module.js';
import { MeController } from './me.controller.js';

@Module({
  imports: [BillingModule],
  controllers: [MeController],
})
export class MeModule {}
