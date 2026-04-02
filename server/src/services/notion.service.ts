import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@notionhq/client';

export interface Story {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'completed';
  assignedAgent?: string;
}

export interface TestResult {
  passed: number;
  failed: number;
  total: number;
  duration?: number;
  screenshots: string[];
  logs?: string[];
}

@Injectable()
export class NotionService {
  private readonly logger = new Logger(NotionService.name);
  private notion: Client;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('NOTION_API_KEY');
    if (!apiKey) {
      throw new Error('NOTION_API_KEY is required');
    }
    this.notion = new Client({ auth: apiKey });
  }

  async readStory(pageId: string): Promise<Story> {
    try {
      const page = await this.notion.pages.retrieve({ page_id: pageId });

      // Type assertion for properties access
      const pageWithProperties = page as any;
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
        status: status as any,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? String(error.message) : 'Unknown error';
      this.logger.error(`Failed to read story ${pageId}: ${errorMessage}`);
      throw new Error(`Notion API error: ${errorMessage}`);
    }
  }

  async updateResult(
    pageId: string,
    result: TestResult,
  ): Promise<{ success: boolean }> {
    try {
      const status =
        result.failed === 0 ? 'Completed' : result.failed === result.total ? 'Failed' : 'Partial';

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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? String(error.message) : 'Unknown error';
      this.logger.error(`Failed to update Notion page ${pageId}: ${errorMessage}`);
      throw new Error(`Notion API error: ${errorMessage}`);
    }
  }

  async appendLog(pageId: string, log: string): Promise<void> {
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? String(error.message) : 'Unknown error';
      this.logger.warn(`Failed to append log to ${pageId}: ${errorMessage}`);
    }
  }

  async syncWithRetry(
    operation: () => Promise<void>,
    maxRetries = 3,
    delay = 1000,
  ): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await operation();
        return;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? String(error.message) : 'Unknown error';
        if (errorMessage.includes('rate_limit')) {
          this.logger.warn(
            `Rate limited, retrying (${attempt}/${maxRetries})...`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        } else {
          throw error;
        }
      }
    }
    throw new Error(`Operation failed after ${maxRetries} retries`);
  }
}
