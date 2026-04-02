var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Post, Body, Patch, Param, Query, UseInterceptors, ClassSerializerInterceptor, } from '@nestjs/common';
// TODO: Uncomment when swagger is installed
// import {
//   ApiTags,
//   ApiCreatedResponse,
//   ApiOkResponse,
//   ApiBadRequestError,
//   ApiUnauthorizedResponse,
// } from '@nestjs/swagger';
import { CreateJobDto, UpdateJobDto, JobFilterDto } from '../dtos/create-job.dto';
// @ApiTags('jobs')
let JobsController = class JobsController {
    // @ApiOkResponse({
    //   description: 'List of all jobs with optional filtering',
    // })
    findAll(filter) {
        return {
            jobs: [],
            totalCount: 0,
            page: filter.offset || 0,
            limit: filter.limit || 20,
        };
    }
    // @ApiOkResponse({
    //   description: 'Get job by ID',
    // })
    findOne(id) {
        return {
            id,
            title: 'Sample Job',
            status: 'pending',
            storyUrl: 'https://notion.so/story/123',
        };
    }
    // @ApiCreatedResponse({
    //   description: 'Create a new job',
    // })
    create(createJobDto) {
        return {
            id: `job-${Date.now()}`,
            ...createJobDto,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
    }
    // @ApiOkResponse({
    //   description: 'Update job status or data',
    // })
    update(id, updateJobDto) {
        return {
            id,
            ...updateJobDto,
            updatedAt: new Date().toISOString(),
        };
    }
};
__decorate([
    Get()
    // @ApiOkResponse({
    //   description: 'List of all jobs with optional filtering',
    // })
    ,
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [JobFilterDto]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "findAll", null);
__decorate([
    Get(':id')
    // @ApiOkResponse({
    //   description: 'Get job by ID',
    // })
    ,
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "findOne", null);
__decorate([
    Post()
    // @ApiCreatedResponse({
    //   description: 'Create a new job',
    // })
    ,
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateJobDto]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "create", null);
__decorate([
    Patch(':id')
    // @ApiOkResponse({
    //   description: 'Update job status or data',
    // })
    ,
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateJobDto]),
    __metadata("design:returntype", void 0)
], JobsController.prototype, "update", null);
JobsController = __decorate([
    Controller('jobs'),
    UseInterceptors(ClassSerializerInterceptor)
], JobsController);
export { JobsController };
// @ApiTags('agents')
let AgentsController = class AgentsController {
    // @ApiOkResponse({
    //   description: 'List all agents with status',
    // })
    findAll() {
        return [
            { id: 'agent-001', hostname: 'mac-1', status: 'idle' },
            { id: 'agent-002', hostname: 'win-1', status: 'busy' },
        ];
    }
    // @ApiOkResponse({
    //   description: 'Get agent by ID',
    // })
    findOne(id) {
        return { id, hostname: 'mac-1', status: 'idle' };
    }
};
__decorate([
    Get()
    // @ApiOkResponse({
    //   description: 'List all agents with status',
    // })
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AgentsController.prototype, "findAll", null);
__decorate([
    Get(':id')
    // @ApiOkResponse({
    //   description: 'Get agent by ID',
    // })
    ,
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AgentsController.prototype, "findOne", null);
AgentsController = __decorate([
    Controller('agents')
], AgentsController);
export { AgentsController };
// @ApiTags('projects')
let ProjectsController = class ProjectsController {
    // @ApiOkResponse({
    //   description: 'List all configured projects',
    // })
    findAll() {
        return [
            { id: 'proj-001', name: 'Test Project', active: true },
        ];
    }
};
__decorate([
    Get()
    // @ApiOkResponse({
    //   description: 'List all configured projects',
    // })
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "findAll", null);
ProjectsController = __decorate([
    Controller('projects')
], ProjectsController);
export { ProjectsController };
