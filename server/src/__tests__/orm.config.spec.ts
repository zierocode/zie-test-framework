import { describe, it, expect, beforeEach } from 'vitest';

describe('Database Configuration', () => {
  beforeEach(() => {
    delete process.env.DATABASE_HOST;
    delete process.env.DATABASE_PORT;
    delete process.env.DATABASE_USER;
    delete process.env.DATABASE_PASSWORD;
    delete process.env.DATABASE_NAME;
  });

  it('should get database config from environment variables', () => {
    process.env.DATABASE_HOST = 'localhost';
    process.env.DATABASE_PORT = '5432';
    process.env.DATABASE_USER = 'testuser';
    process.env.DATABASE_PASSWORD = 'testpass';
    process.env.DATABASE_NAME = 'testdb';

    const getEnv = (key: string, fallback?: string | number): string | number => {
      const value = process.env[key];
      if (value !== undefined) return value;
      if (fallback !== undefined) return fallback;
      throw new Error(`Missing required env: ${key}`);
    };

    const host = getEnv('DATABASE_HOST');
    const port = parseInt(getEnv('DATABASE_PORT', 5432) as string, 10);
    const username = getEnv('DATABASE_USER');
    const password = getEnv('DATABASE_PASSWORD');
    const database = getEnv('DATABASE_NAME');

    expect(host).toBe('localhost');
    expect(port).toBe(5432);
    expect(username).toBe('testuser');
    expect(password).toBe('testpass');
    expect(database).toBe('testdb');
  });

  it('should use default port 5432 when DATABASE_PORT is not set', () => {
    process.env.DATABASE_HOST = 'localhost';
    process.env.DATABASE_USER = 'testuser';
    process.env.DATABASE_PASSWORD = 'testpass';
    process.env.DATABASE_NAME = 'testdb';
    delete process.env.DATABASE_PORT;

    const getEnv = (key: string, fallback?: string | number): string | number => {
      const value = process.env[key];
      if (value !== undefined) return value;
      if (fallback !== undefined) return fallback;
      throw new Error(`Missing required env: ${key}`);
    };

    const port = parseInt(getEnv('DATABASE_PORT', 5432) as string, 10);
    expect(port).toBe(5432);
  });

  it('should throw error for missing required env vars', () => {
    process.env.DATABASE_HOST = 'localhost';
    // DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME are missing

    const getEnv = (key: string, fallback?: string | number): string | number => {
      const value = process.env[key];
      if (value !== undefined) return value;
      if (fallback !== undefined) return fallback;
      throw new Error(`Missing required env: ${key}`);
    };

    expect(() => getEnv('DATABASE_USER')).toThrow('Missing required env: DATABASE_USER');
    expect(() => getEnv('DATABASE_PASSWORD')).toThrow('Missing required env: DATABASE_PASSWORD');
  });
});
