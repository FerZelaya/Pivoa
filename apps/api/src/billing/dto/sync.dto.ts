import { IsString, MinLength } from 'class-validator';

export class SyncBillingDto {
  @IsString()
  @MinLength(3)
  subscriptionId!: string;
}
