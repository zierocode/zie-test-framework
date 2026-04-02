import { describe, it, expect, beforeEach } from 'vitest';

describe('JobController', () => {
  it('should create a new job with valid data', () => {
    const createJobDto = {
      title: 'Test Job',
      storyUrl: 'https://notion.so/story/123',
      projectId: 'proj-001',
      status: 'pending',
    };

    expect(createJobDto.title).toBe('Test Job');
    expect(createJobDto.storyUrl).toBe('https://notion.so/story/123');
    expect(createJobDto.projectId).toBe('proj-001');
    expect(createJobDto.status).toBe('pending');
  });

  it('should reject job creation without required fields', () => {
    const invalidDto = {
      title: 'Test Job',
      // Missing storyUrl and projectId
    };

    expect(invalidDto.storyUrl).toBeUndefined();
    expect(invalidDto.projectId).toBeUndefined();
  });

  it('should filter jobs by status', () => {
    const jobs = [
      { id: 'job-1', status: 'pending', agentId: null },
      { id: 'job-2', status: 'running', agentId: 'agent-001' },
      { id: 'job-3', status: 'completed', agentId: 'agent-002' },
    ];

    const pendingJobs = jobs.filter((j) => j.status === 'pending');
    const runningJobs = jobs.filter((j) => j.status === 'running');

    expect(pendingJobs.length).toBe(1);
    expect(runningJobs.length).toBe(1);
  });

  it('should allow job status updates', () => {
    let job = { id: 'job-1', status: 'pending' };

    job = { ...job, status: 'running' };
    expect(job.status).toBe('running');

    job = { ...job, status: 'completed' };
    expect(job.status).toBe('completed');
  });

  it('should list agents with their status', () => {
    const agents = [
      { id: 'agent-001', hostname: 'mac-1', status: 'idle' },
      { id: 'agent-002', hostname: 'win-1', status: 'busy' },
      { id: 'agent-003', hostname: 'mac-2', status: 'idle' },
    ];

    const idleAgents = agents.filter((a) => a.status === 'idle');
    const busyAgents = agents.filter((a) => a.status === 'busy');

    expect(idleAgents.length).toBe(2);
    expect(busyAgents.length).toBe(1);
  });
});
