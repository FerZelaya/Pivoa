import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ReceiptParser, ParsedReceipt } from '../interfaces/receipt-parser.interface.js';

@Injectable()
export class GeminiReceiptParser implements ReceiptParser {
  private apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
  }

  async parse(imageUrl: string): Promise<ParsedReceipt> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const prompt = `Analyze this receipt image and extract the following information in JSON format:
{
  "amount": <total amount as a number>,
  "vendor": "<store/vendor name>",
  "date": "<date in YYYY-MM-DD format, or null if not found>",
  "suggestedCategory": "<one of: Food, Transport, Utilities, Entertainment, Health, Shopping, Housing, Other>"
}

Only return the JSON object, no other text.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: 'image/jpeg',
                      data: await this.fetchImageAsBase64(imageUrl),
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textContent) {
        throw new Error('No response from Gemini');
      }

      const parsed = JSON.parse(textContent);
      
      return {
        amount: typeof parsed.amount === 'number' ? parsed.amount : 0,
        vendor: parsed.vendor || null,
        date: parsed.date || null,
        suggestedCategory: parsed.suggestedCategory || null,
      };
    } catch (error) {
      console.error('Gemini parsing error:', error);
      throw new Error('Failed to parse receipt with AI');
    }
  }

  private async fetchImageAsBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer).toString('base64');
  }
}
