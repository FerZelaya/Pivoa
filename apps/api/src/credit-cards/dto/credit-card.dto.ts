import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateCreditCardDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  statementCloseDay!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  paymentDueDay!: number;

  @IsOptional()
  @Matches(/^[A-Za-z]{3}$/)
  currency?: string;

  @IsOptional()
  @IsIn(['none', 'cashback', 'miles', 'points'])
  rewardsType?: 'none' | 'cashback' | 'miles' | 'points';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  rewardsRate?: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  rewardsLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  icon?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;
}

export class UpdateCreditCardDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  statementCloseDay?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  paymentDueDay?: number;

  @IsOptional()
  @Matches(/^[A-Za-z]{3}$/)
  currency?: string;

  @IsOptional()
  @IsIn(['none', 'cashback', 'miles', 'points'])
  rewardsType?: 'none' | 'cashback' | 'miles' | 'points';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  rewardsRate?: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  rewardsLabel?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  icon?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;
}

export class CreateCardChargeDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @Matches(/^[A-Za-z]{3}$/)
  currency?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  vendor?: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}/)
  date!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class RecordCardPaymentDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @Matches(/^[A-Za-z]{3}$/)
  currency?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}/)
  paidAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
