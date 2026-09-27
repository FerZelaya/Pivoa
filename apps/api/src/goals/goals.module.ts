import { Module } from '@nestjs/common';
import { BillingModule } from '../billing/billing.module.js';
import { GoalsController } from './goals.controller.js';

@Module({
  imports: [BillingModule],
  controllers: [GoalsController],
})
export class GoalsModule {}
