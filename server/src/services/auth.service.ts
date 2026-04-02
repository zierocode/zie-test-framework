import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  roles: string[];
}

export interface Session {
  userId: string;
  email: string;
  name: string;
  avatar: string;
  accessToken: string;
  refreshToken?: string;
  createdAt: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private oauth2Client: OAuth2Client;

  constructor(private configService: ConfigService) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');

    this.oauth2Client = new OAuth2Client(clientId, clientSecret);
  }

  getAuthUrl(): string {
    const redirectUri = this.configService.get<string>(
      'GOOGLE_REDIRECT_URI',
      'http://localhost:3000/auth/google/callback',
    );
    const scopes = [
      'profile',
      'email',
      'openid',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    return this.oauth2Client.generateAuthUrl({
      redirect_uri: redirectUri,
      scope: scopes.join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
    });
  }

  async verifyIdToken(idToken: string): Promise<User> {
    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid ID token payload');
      }

      const userPayload = payload as any;

      return {
        id: userPayload.sub,
        email: userPayload.email,
        name: userPayload.name ? String(userPayload.name) : undefined,
        picture: userPayload.picture ? String(userPayload.picture) : undefined,
        roles: ['user'],
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? String(error.message) : 'Unknown error';
      throw new Error(`Token verification failed: ${errorMessage}`);
    }
  }

  async exchangeCodeForToken(code: string): Promise<Session> {
    const redirectUri = this.configService.get<string>(
      'GOOGLE_REDIRECT_URI',
      'http://localhost:3000/auth/google/callback',
    );

    const { tokens } = await this.oauth2Client.getToken(code);
    if (!tokens.access_token) {
      throw new Error('Failed to get access token');
    }

    // Get user info
    const userInfo = await this.oauth2Client.request({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    });

    const data = userInfo.data as any;

    return {
      userId: data.id,
      email: data.email,
      name: data.name ? String(data.name) : 'Unknown',
      avatar: data.picture ? String(data.picture) : '',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || '',
      createdAt: new Date().toISOString(),
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      // Use request method to refresh token manually
      const res = await this.oauth2Client.request({
        method: 'POST',
        url: 'https://oauth2.googleapis.com/token',
        data: {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: this.configService.get<string>('GOOGLE_CLIENT_ID'),
          client_secret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
        },
      });
      const response = res.data as any;
      return { access_token: response.access_token };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? String(error.message) : 'Unknown error';
      throw new Error(`Refresh token failed: ${errorMessage}`);
    }
  }
}
