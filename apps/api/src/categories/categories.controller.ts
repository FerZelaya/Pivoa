import { Controller, Get, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module.js';
import { CurrentUser } from '../auth/decorators/index.js';
import type { Category } from '@pivoa/shared';

@Controller('categories')
export class CategoriesController {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  @Get()
  async findAll(@CurrentUser() user: User): Promise<Category[]> {
    // Get both system default categories (user_id = null) and user's custom categories
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .or(`user_id.is.null,user_id.eq.${user.id}`)
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return (data || []).map((cat) => ({
      id: cat.id,
      userId: cat.user_id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
    }));
  }
}
