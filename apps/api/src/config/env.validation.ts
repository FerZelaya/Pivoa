import { z } from 'zod';

export const envSchema = z.object({
  // Server
  PORT: z.coerce.number().default(3000),
  WEB_ORIGIN: z.string().default('http://localhost:5173'),

  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // AI Provider (optional - receipt scanning won't work without it)
  AI_PROVIDER: z.enum(['gemini', 'openai', 'anthropic', 'mock']).default('mock'),
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  ADMIN_EMAILS: z.string().optional().default(''),

});

export type EnvConfig = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    throw new Error('Invalid environment configuration');
  }
  return result.data;
}
