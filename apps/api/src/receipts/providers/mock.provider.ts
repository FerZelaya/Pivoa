import { Injectable } from '@nestjs/common';
import type { ReceiptParser, ParsedReceipt } from '../interfaces/receipt-parser.interface.js';

@Injectable()
export class MockReceiptParser implements ReceiptParser {
  async parse(_imageUrl: string): Promise<ParsedReceipt> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return mock data
    return {
      amount: parseFloat((Math.random() * 100 + 10).toFixed(2)),
      vendor: ['Starbucks', 'Walmart', 'Amazon', 'Target', 'Costco'][Math.floor(Math.random() * 5)],
      date: new Date().toISOString().split('T')[0],
      suggestedCategory: ['Food', 'Shopping', 'Transport', 'Entertainment'][Math.floor(Math.random() * 4)],
    };
  }
}
