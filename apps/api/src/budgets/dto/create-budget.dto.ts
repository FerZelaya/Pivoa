import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateCategoryBudgetDto {
  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  @IsNumber()
  @Min(0.01)
  monthlyLimit!: number;
}
