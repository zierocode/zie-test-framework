import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';

export interface AgentRegistration {
  agentId: string;
  hostname: string;
  capabilities: string[];
}

export interface AgentSession {
  agentId: string;
  sessionId: string;
  status: 'idle' | 'busy';
  capabilities: string[];
  lastHeartbeat: Date;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AgentsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(AgentsGateway.name);
  private agents: Map<string, AgentSession> = new Map();

  @WebSocketServer()
  server!: Server;

  afterInit() {
    this.logger.log('WebSocket server initialized');
  }

  handleConnection(client: any) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Find and remove agent associated with this client
    for (const [agentId, session] of this.agents.entries()) {
      if (session.sessionId === client.id) {
        this.agents.delete(agentId);
        this.logger.log(`Agent ${agentId} disconnected`);
        break;
      }
    }
  }

  registerAgent(agentData: AgentRegistration): AgentSession {
    const existingAgent = this.agents.get(agentData.agentId);
    if (existingAgent) {
      // Merge session - update existing agent
      existingAgent.sessionId = `session-${Date.now()}`;
      existingAgent.status = 'idle';
      existingAgent.capabilities = agentData.capabilities;
      existingAgent.lastHeartbeat = new Date();
      this.agents.set(agentData.agentId, existingAgent);
      this.logger.log(`Agent ${agentData.agentId} reconnected`);
      return existingAgent;
    }

    // New agent
    const session: AgentSession = {
      agentId: agentData.agentId,
      sessionId: `session-${Date.now()}`,
      status: 'idle',
      capabilities: agentData.capabilities,
      lastHeartbeat: new Date(),
    };
    this.agents.set(agentData.agentId, session);
    this.logger.log(`Agent ${agentData.agentId} registered`);
    return session;
  }

  getAgent(agentId: string): AgentSession | undefined {
    return this.agents.get(agentId);
  }

  updateHeartbeat(agentId: string) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.lastHeartbeat = new Date();
      this.agents.set(agentId, agent);
    }
  }

  markAgentBusy(agentId: string) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = 'busy';
      this.agents.set(agentId, agent);
    }
  }

  markAgentIdle(agentId: string) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = 'idle';
      this.agents.set(agentId, agent);
    }
  }

  getIdleAgents(): AgentSession[] {
    return Array.from(this.agents.values()).filter(
      (a) => a.status === 'idle',
    );
  }

  broadcastJobAvailable(jobId: string, payload: any) {
    this.server.emit('job_available', { jobId, ...payload });
  }

  broadcastJobCancelled(jobId: string, reason: string) {
    this.server.emit('job_cancelled', { jobId, reason });
  }
}
