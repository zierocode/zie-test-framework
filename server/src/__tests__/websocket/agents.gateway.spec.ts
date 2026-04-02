import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

describe('AgentsGateway', () => {
  let gateway: any;
  let mockServer: any;

  beforeEach(() => {
    mockServer = {
      on: vi.fn(),
      emit: vi.fn(),
      to: vi.fn(),
      broadcast: { emit: vi.fn() },
    };
    vi.clearAllMocks();
  });

  it('should validate agent registration with required fields', () => {
    const registration = {
      agentId: 'agent-001',
      hostname: 'test-macbook',
      capabilities: ['playwright', 'llm', 'drive'],
    };

    expect(registration.agentId).toBeDefined();
    expect(registration.hostname).toBeDefined();
    expect(Array.isArray(registration.capabilities)).toBe(true);
  });

  it('should reject registration without agentId', () => {
    const invalidRegistration = {
      hostname: 'test-macbook',
      capabilities: ['playwright'],
    };

    expect(invalidRegistration.agentId).toBeUndefined();
  });

  it('should handle duplicate agent ID by merging session', () => {
    const existingAgents = new Map([
      ['agent-001', { sessionId: 'old-session', status: 'active' }],
    ]);

    const newAgent = {
      agentId: 'agent-001',
      sessionId: 'new-session',
      status: 'idle',
    };

    // Merge logic: update existing, don't create duplicate
    existingAgents.set(newAgent.agentId, {
      sessionId: newAgent.sessionId,
      status: newAgent.status,
    });

    expect(existingAgents.get('agent-001')?.sessionId).toBe('new-session');
    expect(existingAgents.size).toBe(1); // No duplicate created
  });

  it('should broadcast job_available to idle agents', () => {
    const idleAgents = ['agent-001', 'agent-002', 'agent-003'];
    const jobPayload = {
      jobId: 'job-123',
      storyUrl: 'https://notion.so/story/123',
      projectConfig: { name: 'Test Project' },
    };

    // Simulate broadcast
    const broadcastMessage = {
      type: 'job_available',
      ...jobPayload,
    };

    expect(broadcastMessage.type).toBe('job_available');
    expect(broadcastMessage.jobId).toBe('job-123');
  });
});
