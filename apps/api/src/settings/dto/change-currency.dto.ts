import { MaxLength, Matches } from 'class-validator';

export class ChangeCurrencyDto {
  @Matches(/^[A-Za-z]{3}$/)
  @MaxLength(3)
  currency!: string;
}
