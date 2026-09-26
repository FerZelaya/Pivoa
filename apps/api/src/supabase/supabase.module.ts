import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createSupabaseClient } from './supabase.client.js';

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: SUPABASE_CLIENT,
      useFactory: (configService: ConfigService) => {
        const supabaseUrl = configService.getOrThrow<string>('SUPABASE_URL');
        const serviceRoleKey = configService.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY');

        return createSupabaseClient(supabaseUrl, serviceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [SUPABASE_CLIENT],
})
export class SupabaseModule {}
