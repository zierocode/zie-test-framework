var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AgentsGateway_1;
import { WebSocketGateway, WebSocketServer, } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
let AgentsGateway = AgentsGateway_1 = class AgentsGateway {
    constructor() {
        this.logger = new Logger(AgentsGateway_1.name);
        this.agents = new Map();
    }
    afterInit() {
        this.logger.log('WebSocket server initialized');
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
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
    registerAgent(agentData) {
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
        const session = {
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
    getAgent(agentId) {
        return this.agents.get(agentId);
    }
    updateHeartbeat(agentId) {
        const agent = this.agents.get(agentId);
        if (agent) {
            agent.lastHeartbeat = new Date();
            this.agents.set(agentId, agent);
        }
    }
    markAgentBusy(agentId) {
        const agent = this.agents.get(agentId);
        if (agent) {
            agent.status = 'busy';
            this.agents.set(agentId, agent);
        }
    }
    markAgentIdle(agentId) {
        const agent = this.agents.get(agentId);
        if (agent) {
            agent.status = 'idle';
            this.agents.set(agentId, agent);
        }
    }
    getIdleAgents() {
        return Array.from(this.agents.values()).filter((a) => a.status === 'idle');
    }
    broadcastJobAvailable(jobId, payload) {
        this.server.emit('job_available', { jobId, ...payload });
    }
    broadcastJobCancelled(jobId, reason) {
        this.server.emit('job_cancelled', { jobId, reason });
    }
};
__decorate([
    WebSocketServer(),
    __metadata("design:type", Server)
], AgentsGateway.prototype, "server", void 0);
AgentsGateway = AgentsGateway_1 = __decorate([
    Injectable(),
    WebSocketGateway({
        cors: {
            origin: '*',
        },
    })
], AgentsGateway);
export { AgentsGateway };
