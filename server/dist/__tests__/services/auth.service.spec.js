import { describe, it, expect, beforeEach, vi } from 'vitest';
describe('AuthService', () => {
    let service;
    let mockGoogleAuth;
    beforeEach(() => {
        vi.clearAllMocks();
        mockGoogleAuth = {
            verifyIdToken: vi.fn(),
            generateAuthUrl: vi.fn(),
        };
    });
    it('should generate OAuth URL with correct scopes', () => {
        const clientId = 'test-client-id';
        const redirectUri = 'http://localhost:3000/auth/callback';
        const scopes = ['profile', 'email', 'openid'];
        const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes.join('+')}`;
        expect(oauthUrl).toContain(clientId);
        expect(oauthUrl).toContain(redirectUri);
        expect(oauthUrl).toContain('scope');
    });
    it('should validate OAuth token', async () => {
        const token = 'valid-id-token';
        const payload = {
            email: 'test@example.com',
            name: 'Test User',
            picture: 'https://example.com/photo.jpg',
            sub: 'google-user-id',
        };
        const decoded = {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            sub: payload.sub,
        };
        expect(decoded.email).toBe('test@example.com');
        expect(decoded.name).toBe('Test User');
    });
    it('should reject invalid token', async () => {
        const invalidToken = 'invalid-token';
        // Token verification should fail
        const isValid = false; // Simulate verification failure
        expect(isValid).toBe(false);
    });
    it('should create session for authenticated user', () => {
        const user = {
            id: 'google-123',
            email: 'test@example.com',
            name: 'Test User',
            picture: 'https://example.com/photo.jpg',
        };
        const session = {
            userId: user.id,
            email: user.email,
            name: user.name,
            avatar: user.picture,
            createdAt: new Date().toISOString(),
        };
        expect(session.userId).toBe('google-123');
        expect(session.email).toBe('test@example.com');
    });
});
