import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
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
@Controller('jobs')
@UseInterceptors(ClassSerializerInterceptor)
export class JobsController {
  @Get()
  // @ApiOkResponse({
  //   description: 'List of all jobs with optional filtering',
  // })
  findAll(@Query() filter: JobFilterDto) {
    return {
      jobs: [],
      totalCount: 0,
      page: filter.offset || 0,
      limit: filter.limit || 20,
    };
  }

  @Get(':id')
  // @ApiOkResponse({
  //   description: 'Get job by ID',
  // })
  findOne(@Param('id') id: string) {
    return {
      id,
      title: 'Sample Job',
      status: 'pending',
      storyUrl: 'https://notion.so/story/123',
    };
  }

  @Post()
  // @ApiCreatedResponse({
  //   description: 'Create a new job',
  // })
  create(@Body() createJobDto: CreateJobDto) {
    return {
      id: `job-${Date.now()}`,
      ...createJobDto,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  }

  @Patch(':id')
  // @ApiOkResponse({
  //   description: 'Update job status or data',
  // })
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return {
      id,
      ...updateJobDto,
      updatedAt: new Date().toISOString(),
    };
  }
}

// @ApiTags('agents')
@Controller('agents')
export class AgentsController {
  @Get()
  // @ApiOkResponse({
  //   description: 'List all agents with status',
  // })
  findAll() {
    return [
      { id: 'agent-001', hostname: 'mac-1', status: 'idle' },
      { id: 'agent-002', hostname: 'win-1', status: 'busy' },
    ];
  }

  @Get(':id')
  // @ApiOkResponse({
  //   description: 'Get agent by ID',
  // })
  findOne(@Param('id') id: string) {
    return { id, hostname: 'mac-1', status: 'idle' };
  }
}

// @ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  @Get()
  // @ApiOkResponse({
  //   description: 'List all configured projects',
  // })
  findAll() {
    return [
      { id: 'proj-001', name: 'Test Project', active: true },
    ];
  }
}
