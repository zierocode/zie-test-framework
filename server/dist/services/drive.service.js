var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DriveService_1;
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
let DriveService = DriveService_1 = class DriveService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new Logger(DriveService_1.name);
        const credentials = this.loadServiceAccountCredentials();
        this.drive = google.drive({
            version: 'v3',
            auth: credentials,
        });
    }
    loadServiceAccountCredentials() {
        const keyFilePath = this.configService.get('GOOGLE_SERVICE_ACCOUNT_KEY');
        if (!keyFilePath) {
            throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is required');
        }
        const { GoogleAuth } = require('google-auth-library');
        return new GoogleAuth({
            keyFilename: keyFilePath,
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });
    }
    async createFolder(name, parentId) {
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Failed to create folder: ${errorMessage}`);
            throw new Error(`Drive API error: ${errorMessage}`);
        }
    }
    async uploadFile(fileBuffer, fileName, mimeType, folderId) {
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Failed to upload to Drive: ${errorMessage}`);
            throw new Error(`Drive upload error: ${errorMessage}`);
        }
    }
    async uploadScreenshot(screenshotBuffer, testId, folderId) {
        return this.uploadFile(screenshotBuffer, `${testId}-screenshot.png`, 'image/png', folderId);
    }
    async uploadVideo(videoBuffer, testName, folderId) {
        return this.uploadFile(videoBuffer, `${testName}-recording.mp4`, 'video/mp4', folderId);
    }
    async uploadWithRetry(fileBuffer, fileName, mimeType, folderId, maxRetries = 3) {
        let lastError = null;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await this.uploadFile(fileBuffer, fileName, mimeType, folderId);
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                this.logger.warn(`Upload attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);
                // Don't retry on 4xx errors (client errors)
                if (error instanceof Error && 'response' in error) {
                    const errWithResp = error;
                    if (errWithResp.response?.status && errWithResp.response.status < 500) {
                        throw error;
                    }
                }
                await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            }
        }
        throw new Error(`Upload failed after ${maxRetries} retries: ${lastError?.message}`);
    }
};
DriveService = DriveService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], DriveService);
export { DriveService };
