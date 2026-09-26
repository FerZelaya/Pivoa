import { Type } from 'class-transformer';
import { IsOptional, IsNumber, IsInt, Min, Max, MaxLength, Matches } from 'class-validator';

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
}
