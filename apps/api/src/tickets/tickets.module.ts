import { Module } from '@nestjs/common';
import { BillingModule } from '../billing/billing.module.js';
import { TicketsController } from './tickets.controller.js';

@Module({
  imports: [BillingModule],
  controllers: [TicketsController],
})
export class TicketsModule {}