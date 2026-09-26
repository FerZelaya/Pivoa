import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

type CreateClientOptions = NonNullable<Parameters<typeof createClient>[2]>;

/**
 * Node 20 (Railway default) has no native WebSocket. supabase-js 2.7x
 * requires Node 22+ or an explicit transport.
 */
export function createSupabaseClient(url: string, key: string, options: CreateClientOptions = {}) {
  return createClient(url, key, {
    ...options,
    realtime: {
      ...options.realtime,
      transport: ws as unknown as NonNullable<CreateClientOptions['realtime']>['transport'],
    },
  });
}
