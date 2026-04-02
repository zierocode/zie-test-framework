import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import type { drive_v3 } from 'googleapis';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
}

export interface UploadResult {
  fileId: string;
  fileUrl: string;
  fileName: string;
}

@Injectable()
export class DriveService {
  private readonly logger = new Logger(DriveService.name);
  private drive: drive_v3.Drive;

  constructor(private configService: ConfigService) {
    const credentials = this.loadServiceAccountCredentials();
    this.drive = google.drive({
      version: 'v3',
      auth: credentials,
    });
  }

  private loadServiceAccountCredentials() {
    const keyFilePath = this.configService.get<string>(
      'GOOGLE_SERVICE_ACCOUNT_KEY',
    );
    if (!keyFilePath) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is required');
    }

    const { GoogleAuth } = require('google-auth-library');
    return new GoogleAuth({
      keyFilename: keyFilePath,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
  }

  async createFolder(
    name: string,
    parentId?: string,
  ): Promise<{ id: string; name: string }> {
    try {
      const fileMetadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : ['root'],
      };

      const file = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: 'id, name',
      });

      this.logger.log(`Created Drive folder: ${name} (${file.data.id})`);
      return { id: file.data.id || '', name };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create folder: ${errorMessage}`);
      throw new Error(`Drive API error: ${errorMessage}`);
    }
  }

  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    folderId: string,
  ): Promise<UploadResult> {
    try {
      const fileMetadata = {
        name: fileName,
        parents: [folderId],
      };

      const media = {
        mimeType,
        body: fileBuffer,
      };

      const file = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name',
      });

      this.logger.log(`Uploaded to Drive: ${fileName} (${file.data.id})`);

      return {
        fileId: file.data.id || '',
        fileUrl: `https://drive.google.com/file/d/${file.data.id}/view`,
        fileName,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to upload to Drive: ${errorMessage}`);
      throw new Error(`Drive upload error: ${errorMessage}`);
    }
  }

  async uploadScreenshot(
    screenshotBuffer: Buffer,
    testId: string,
    folderId: string,
  ): Promise<UploadResult> {
    return this.uploadFile(
      screenshotBuffer,
      `${testId}-screenshot.png`,
      'image/png',
      folderId,
    );
  }

  async uploadVideo(
    videoBuffer: Buffer,
    testName: string,
    folderId: string,
  ): Promise<UploadResult> {
    return this.uploadFile(
      videoBuffer,
      `${testName}-recording.mp4`,
      'video/mp4',
      folderId,
    );
  }

  async uploadWithRetry(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    folderId: string,
    maxRetries = 3,
  ): Promise<UploadResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.uploadFile(
          fileBuffer,
          fileName,
          mimeType,
          folderId,
        );
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(
          `Upload attempt ${attempt}/${maxRetries} failed: ${lastError.message}`,
        );

        // Don't retry on 4xx errors (client errors)
        if (error instanceof Error && 'response' in error) {
          const errWithResp = error as any;
          if (errWithResp.response?.status && errWithResp.response.status < 500) {
            throw error;
          }
        }

        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * attempt), // Exponential backoff
        );
      }
    }

    throw new Error(
      `Upload failed after ${maxRetries} retries: ${lastError?.message}`,
    );
  }
}
