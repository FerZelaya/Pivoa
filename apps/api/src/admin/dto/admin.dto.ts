import { IsBoolean, IsIn } from 'class-validator';

export class SetOnboardingDto {
  @IsBoolean()
  completed!: boolean;
}

export class GrantPlanDto {
  @IsIn(['free', 'plus', 'pro'])
  plan!: 'free' | 'plus' | 'pro';
}
