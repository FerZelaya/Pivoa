import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ReceiptParser, ParsedReceipt } from '../interfaces/receipt-parser.interface.js';

@Injectable()
export class OpenAIReceiptParser implements ReceiptParser {
  private apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
  }

  async parse(imageUrl: string): Promise<ParsedReceipt> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const prompt = `Analyze this receipt image and extract the following information. Return ONLY a JSON object with these exact fields:
{
  "amount": <total amount as a number>,
  "vendor": "<store/vendor name>",
  "date": "<date in YYYY-MM-DD format, or null if not found>",
  "suggestedCategory": "<one of: Food, Transport, Utilities, Entertainment, Health, Shopping, Housing, Other>"
}`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: imageUrl } },
              ],
            },
          ],
          response_format: { type: 'json_object' },
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const textContent = data.choices?.[0]?.message?.content;

      if (!textContent) {
        throw new Error('No response from OpenAI');
      }

      const parsed = JSON.parse(textContent);

      return {
        amount: typeof parsed.amount === 'number' ? parsed.amount : 0,
        vendor: parsed.vendor || null,
        date: parsed.date || null,
        suggestedCategory: parsed.suggestedCategory || null,
      };
    } catch (error) {
      console.error('OpenAI parsing error:', error);
      throw new Error('Failed to parse receipt with AI');
    }
  }
}
