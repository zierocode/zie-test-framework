export class CreateJobDto {
  title: string;
  storyUrl: string;
  projectId: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
}

export class UpdateJobDto {
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  agentId?: string;
  resultData?: Record<string, any>;
  notes?: string;
}

export class JobFilterDto {
  status?: string;
  agentId?: string;
  projectId?: string;
  limit?: number;
  offset?: number;
}
