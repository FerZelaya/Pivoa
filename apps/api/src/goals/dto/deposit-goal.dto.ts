import { IsNumber, Min } from 'class-validator';

export class DepositToGoalDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;
}
