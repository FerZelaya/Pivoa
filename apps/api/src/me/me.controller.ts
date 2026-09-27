import { Controller } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { User } from '@supabase/supabase-js';
import type { MeResponse } from '@pivoa/shared';
import { CurrentUser } from '../auth/decorators/index.js';
import { EntitlementsService } from '../billing/entitlements.service.js';
import { isAdminEmail } from '../common/plans.js';

@Controller('me')
export class MeController {
  constructor(
    private readonly entitlements: EntitlementsService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  async me(@CurrentUser() user: User): Promise<MeResponse> {
    const snap = await this.entitlements.snapshot(user.id);
    return {
      id: snap.row.id,
      email: snap.row.email,
      fullName: snap.row.full_name,
      isAdmin: isAdminEmail(user.email, this.config.get<string>('ADMIN_EMAILS')),
      plan: snap.plan,
      subscriptionStatus: (snap.row.subscription_status as MeResponse['subscriptionStatus']) || 'none',
      currentPeriodEnd: snap.row.current_period_end,
      complimentary: snap.row.complimentary,
      receiptScansUsed: snap.row.receipt_scans_used,
      receiptScanLimit: snap.limits.scansPerCycle,
      expensesThisCycle: snap.expensesThisCycle,
      expenseLimit: snap.limits.expensesPerCycle,
      goalCount: snap.goalCount,
      goalLimit: snap.limits.goals,
      multiCurrency: snap.limits.multiCurrency,
      csvExport: snap.limits.csv,
      highPriorityTickets: snap.limits.highPriority,
    };
  }
}
