import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import 'multer';
import { SUPABASE_CLIENT } from '../supabase/supabase.module.js';
import { CurrentUser } from '../auth/decorators/index.js';
import { RECEIPT_PARSER, type ReceiptParser, type ParsedReceipt } from './interfaces/receipt-parser.interface.js';

interface ScanResponse extends ParsedReceipt {
  imageUrl: string;
}

@Controller('receipts')
export class ReceiptsController {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    @Inject(RECEIPT_PARSER) private readonly receiptParser: ReceiptParser,
  ) {}

  @Post('scan')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (_req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only JPEG, PNG, WebP, and HEIC images are allowed'), false);
        }
      },
    }),
  )
  async scan(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ScanResponse> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Generate unique filename
    const ext = file.originalname.split('.').pop() || 'jpg';
    const filename = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await this.supabase.storage
      .from('receipts')
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw new BadRequestException(`Failed to upload image: ${uploadError.message}`);
    }

    // Create signed URL (valid for 1 hour)
    const { data: signedUrlData, error: signedUrlError } = await this.supabase.storage
      .from('receipts')
      .createSignedUrl(filename, 3600);

    if (signedUrlError || !signedUrlData) {
      throw new BadRequestException('Failed to create signed URL for image');
    }

    // Parse receipt with AI
    try {
      const parsed = await this.receiptParser.parse(signedUrlData.signedUrl);
      
      return {
        ...parsed,
        imageUrl: signedUrlData.signedUrl,
      };
    } catch (error) {
      // If parsing fails, still return the image URL so user can enter manually
      console.error('Receipt parsing failed:', error);
      return {
        amount: 0,
        vendor: null,
        date: new Date().toISOString().split('T')[0],
        suggestedCategory: null,
        imageUrl: signedUrlData.signedUrl,
      };
    }
  }
}
