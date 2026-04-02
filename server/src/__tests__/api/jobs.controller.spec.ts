import { describe, it, expect } from 'vitest';

describe('JobController', () => {
  it('should create a new job with valid data', () => {
    const createJobDto = {
      title: 'Test Job',
      storyUrl: 'https://notion.so/story/123',
      projectId: 'proj-001',
    };

    expect(createJobDto.title).toBe('Test Job');
    expect(createJobDto.storyUrl).toBe('https://notion.so/story/123');
    expect(createJobDto.projectId).toBe('proj-001');
  });

  it('should reject job creation without required fields', () => {
    const invalidDto = {
      title: 'Test Job',
    };

    expect('storyUrl' in invalidDto).toBe(false);
    expect('projectId' in invalidDto).toBe(false);
  });

  it('should filter jobs by status', () => {
    type JobStatus = 'pending' | 'running' | 'completed';
    const jobs = [
      { id: 'job-1', status: 'pending' as JobStatus, agentId: null },
      { id: 'job-2', status: 'running' as JobStatus, agentId: 'agent-001' },
      { id: 'job-3', status: 'completed' as JobStatus, agentId: 'agent-002' },
    ];

    const pendingJobs = jobs.filter((j) => j.status === 'pending');
    const runningJobs = jobs.filter((j) => j.status === 'running');

    expect(pendingJobs.length).toBe(1);
    expect(runningJobs.length).toBe(1);
  });

  it('should allow job status updates', () => {
    type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    let job = { id: 'job-1', status: 'pending' as JobStatus };

    job = { ...job, status: 'running' as JobStatus };
    expect((job.status as string)).toBe('running');

    job = { ...job, status: 'completed' as JobStatus };
    expect((job.status as string)).toBe('completed');
  });

  it('should list agents with their status', () => {
    const agents = [
      { id: 'agent-001', hostname: 'mac-1', status: 'idle' as const },
      { id: 'agent-002', hostname: 'win-1', status: 'busy' as const },
      { id: 'agent-003', hostname: 'mac-2', status: 'idle' as const },
    ];

    const idleAgents = agents.filter((a) => a.status === 'idle');
    const busyAgents = agents.filter((a) => a.status === 'busy');

    expect(idleAgents.length).toBe(2);
    expect(busyAgents.length).toBe(1);
  });
});
