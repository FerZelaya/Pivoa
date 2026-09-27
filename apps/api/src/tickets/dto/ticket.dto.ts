import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  subject!: string;

  @IsIn(['bug', 'account', 'billing', 'other'])
  category!: 'bug' | 'account' | 'billing' | 'other';

  @IsString()
  @MinLength(10)
  @MaxLength(4000)
  body!: string;

  @IsOptional()
  @IsIn(['low', 'normal', 'high'])
  priority?: 'low' | 'normal' | 'high';
}

export class ReplyTicketDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body!: string;
}

export class UpdateTicketDto {
  @IsOptional()
  @IsIn(['open', 'pending', 'resolved', 'closed'])
  status?: 'open' | 'pending' | 'resolved' | 'closed';

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  reply?: string;
}
