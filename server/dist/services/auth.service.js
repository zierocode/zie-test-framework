var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
let AuthService = AuthService_1 = class AuthService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new Logger(AuthService_1.name);
        const clientId = this.configService.get('GOOGLE_CLIENT_ID');
        const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
        this.oauth2Client = new OAuth2Client(clientId, clientSecret);
    }
    getAuthUrl() {
        const redirectUri = this.configService.get('GOOGLE_REDIRECT_URI', 'http://localhost:3000/auth/google/callback');
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
    async verifyIdToken(idToken) {
        try {
            const ticket = await this.oauth2Client.verifyIdToken({
                idToken,
                audience: this.configService.get('GOOGLE_CLIENT_ID'),
            });
            const payload = ticket.getPayload();
            if (!payload) {
                throw new Error('Invalid ID token payload');
            }
            const userPayload = payload;
            return {
                id: userPayload.sub,
                email: userPayload.email,
                name: userPayload.name ? String(userPayload.name) : undefined,
                picture: userPayload.picture ? String(userPayload.picture) : undefined,
                roles: ['user'],
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? String(error.message) : 'Unknown error';
            throw new Error(`Token verification failed: ${errorMessage}`);
        }
    }
    async exchangeCodeForToken(code) {
        const redirectUri = this.configService.get('GOOGLE_REDIRECT_URI', 'http://localhost:3000/auth/google/callback');
        const { tokens } = await this.oauth2Client.getToken(code);
        if (!tokens.access_token) {
            throw new Error('Failed to get access token');
        }
        // Get user info
        const userInfo = await this.oauth2Client.request({
            url: 'https://www.googleapis.com/oauth2/v2/userinfo',
        });
        const data = userInfo.data;
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
    async refreshAccessToken(refreshToken) {
        try {
            // Use request method to refresh token manually
            const res = await this.oauth2Client.request({
                method: 'POST',
                url: 'https://oauth2.googleapis.com/token',
                data: {
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                    client_id: this.configService.get('GOOGLE_CLIENT_ID'),
                    client_secret: this.configService.get('GOOGLE_CLIENT_SECRET'),
                },
            });
            const response = res.data;
            return { access_token: response.access_token };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? String(error.message) : 'Unknown error';
            throw new Error(`Refresh token failed: ${errorMessage}`);
        }
    }
};
AuthService = AuthService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], AuthService);
export { AuthService };
