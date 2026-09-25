export interface ParsedReceipt {
  amount: number;
  vendor: string | null;
  date: string | null;
  suggestedCategory: string | null;
}

export interface ReceiptParser {
  parse(imageUrl: string): Promise<ParsedReceipt>;
}

export const RECEIPT_PARSER = 'RECEIPT_PARSER';
