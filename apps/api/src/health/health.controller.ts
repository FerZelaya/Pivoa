import { Controller, Get, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module.js';
import type { HealthResponse } from '@pivoa/shared';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  @Get()
  async check(): Promise<HealthResponse> {
    let dbStatus: 'connected' | 'disconnected' = 'disconnected';

    try {
      // Simple query to check database connection
      const { error } = await this.supabase
        .from('categories')
        .select('id')
        .limit(1);

      if (!error) {
        dbStatus = 'connected';
      }
    } catch {
      dbStatus = 'disconnected';
    }

    return {
      status: dbStatus === 'connected' ? 'ok' : 'error',
      db: dbStatus,
      timestamp: new Date().toISOString(),
    };
  }
}
