import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, IsDateString, Min, MaxLength } from 'class-validator';

export class CreateExpenseDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  vendor?: string;

  @IsDateString()
  @IsNotEmpty()
  date!: string;

  @IsOptional()
  @IsString()
  receiptImageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
