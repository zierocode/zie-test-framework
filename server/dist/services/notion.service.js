var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotionService_1;
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@notionhq/client';
let NotionService = NotionService_1 = class NotionService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new Logger(NotionService_1.name);
        const apiKey = this.configService.get('NOTION_API_KEY');
        if (!apiKey) {
            throw new Error('NOTION_API_KEY is required');
        }
        this.notion = new Client({ auth: apiKey });
    }
    async readStory(pageId) {
        try {
            const page = await this.notion.pages.retrieve({ page_id: pageId });
            // Type assertion for properties access
            const pageWithProperties = page;
            const properties = pageWithProperties.properties;
            // Extract title from properties (can be 'name' or 'title')
            const titleProperty = properties?.name || properties?.title;
            const title = titleProperty?.title?.[0]?.plain_text || 'Untitled';
            // Extract status
            const statusProperty = properties?.Status;
            const status = statusProperty?.status?.name || 'pending';
            return {
                id: pageId,
                title,
                content: '',
                status: status,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? String(error.message) : 'Unknown error';
            this.logger.error(`Failed to read story ${pageId}: ${errorMessage}`);
            throw new Error(`Notion API error: ${errorMessage}`);
        }
    }
    async updateResult(pageId, result) {
        try {
            const status = result.failed === 0 ? 'Completed' : result.failed === result.total ? 'Failed' : 'Partial';
            await this.notion.pages.update({
                page_id: pageId,
                properties: {
                    Status: { status: { name: status } },
                    Results: {
                        rich_text: [
                            {
                                type: 'text',
                                text: {
                                    content: `${result.passed} passed, ${result.failed} failed`,
                                },
                            },
                        ],
                    },
                },
            });
            this.logger.log(`Updated Notion page ${pageId}: ${status}`);
            return { success: true };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? String(error.message) : 'Unknown error';
            this.logger.error(`Failed to update Notion page ${pageId}: ${errorMessage}`);
            throw new Error(`Notion API error: ${errorMessage}`);
        }
    }
    async appendLog(pageId, log) {
        try {
            await this.notion.blocks.children.append({
                block_id: pageId,
                children: [
                    {
                        object: 'block',
                        type: 'callout',
                        callout: {
                            rich_text: [{ type: 'text', text: { content: log } }],
                        },
                    },
                ],
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? String(error.message) : 'Unknown error';
            this.logger.warn(`Failed to append log to ${pageId}: ${errorMessage}`);
        }
    }
    async syncWithRetry(operation, maxRetries = 3, delay = 1000) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await operation();
                return;
            }
            catch (error) {
                const errorMessage = error instanceof Error ? String(error.message) : 'Unknown error';
                if (errorMessage.includes('rate_limit')) {
                    this.logger.warn(`Rate limited, retrying (${attempt}/${maxRetries})...`);
                    await new Promise((resolve) => setTimeout(resolve, delay * attempt));
                }
                else {
                    throw error;
                }
            }
        }
        throw new Error(`Operation failed after ${maxRetries} retries`);
    }
};
NotionService = NotionService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], NotionService);
export { NotionService };
