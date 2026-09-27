import { Module } from '@nestjs/common';
import { BillingModule } from '../billing/billing.module.js';
import { ConfigService } from '@nestjs/config';
import { ReceiptsController } from './receipts.controller.js';
import { RECEIPT_PARSER } from './interfaces/receipt-parser.interface.js';
import { MockReceiptParser } from './providers/mock.provider.js';
import { GeminiReceiptParser } from './providers/gemini.provider.js';
import { OpenAIReceiptParser } from './providers/openai.provider.js';

@Module({
  imports: [BillingModule],
  controllers: [ReceiptsController],
  providers: [
    {
      provide: RECEIPT_PARSER,
      useFactory: (configService: ConfigService) => {
        const provider = configService.get<string>('AI_PROVIDER', 'mock');
        
        switch (provider) {
          case 'gemini':
            return new GeminiReceiptParser(configService);
          case 'openai':
            return new OpenAIReceiptParser(configService);
          case 'mock':
          default:
            return new MockReceiptParser();
        }
      },
      inject: [ConfigService],
    },
  ],
})
export class ReceiptsModule {}
