import { IsIn } from 'class-validator';

export class CheckoutDto {
  @IsIn(['plus', 'pro'])
  plan!: 'plus' | 'pro';

  @IsIn(['month', 'year'])
  interval!: 'month' | 'year';
}
