import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsInt, Min, Max, MaxLength, Matches, IsIn } from 'class-validator';

export class CompleteOnboardingDto {
  @IsNumber()
  @Min(0)
  monthlyIncomeCap!: number;

  @IsOptional()
  @Matches(/^[A-Za-z]{3}$/)
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  cycleStartDay?: number;

  @IsOptional()
  @IsIn(['en', 'es'])
  language?: 'en' | 'es';
}
