import { Type } from 'class-transformer';
import { IsOptional, IsNumber, IsInt, IsBoolean, Min, Max, MaxLength, Matches, IsIn } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyIncomeCap?: number;

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

  @IsOptional()
  @IsBoolean()
  tutorialCompleted?: boolean;
}
