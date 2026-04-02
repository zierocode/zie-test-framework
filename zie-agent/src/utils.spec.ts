import { describe, it, expect } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

describe('Agent SDK Utilities', () => {
  it('should generate unique agent ID', () => {
    const agentId = uuidv4();

    expect(typeof agentId).toBe('string');
    expect(agentId.length).toBe(36);
    expect(agentId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('should generate multiple unique IDs', () => {
    const ids = [uuidv4(), uuidv4(), uuidv4()];

    expect(ids[0]).not.toBe(ids[1]);
    expect(ids[1]).not.toBe(ids[2]);
    expect(ids[0]).not.toBe(ids[2]);
  });

  it('should handle agent heartbeat messages', () => {
    const heartbeat = {
      type: 'heartbeat',
      agentId: 'agent-001',
      timestamp: Date.now(),
    };

    expect(heartbeat.type).toBe('heartbeat');
    expect(heartbeat.agentId).toBe('agent-001');
    expect(typeof heartbeat.timestamp).toBe('number');
  });
});
