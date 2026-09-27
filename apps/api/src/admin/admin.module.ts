import { Module } from '@nestjs/common';
import { BillingModule } from '../billing/billing.module.js';
import { AdminController } from './admin.controller.js';

@Module({
  imports: [BillingModule],
  controllers: [AdminController],
})
export class AdminModule {}