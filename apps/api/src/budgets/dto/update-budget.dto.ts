import { IsNumber, Min } from 'class-validator';

export class UpdateCategoryBudgetDto {
  @IsNumber()
  @Min(0.01)
  monthlyLimit!: number;
}
