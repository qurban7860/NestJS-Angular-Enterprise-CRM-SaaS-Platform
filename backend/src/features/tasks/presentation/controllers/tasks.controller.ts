import { Controller, Post, Body, Patch, Param, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateTaskUseCase } from '../../application/use-cases/create-task.use-case';
import { ListTasksUseCase } from '../../application/use-cases/list-tasks.use-case';
import { CreateTaskDto, TaskResponseDto } from '../../application/dtos/task.dto';
import { CurrentUser } from '../../../../core/presentation/decorators/current-user.decorator';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly listTasksUseCase: ListTasksUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all tasks for the current organization' })
  @ApiResponse({ status: 200, type: [TaskResponseDto] })
  async findAll(@CurrentUser() user: any) {
    const result = await this.listTasksUseCase.execute(user.orgId);
    if (result.isFailure) {
      throw result.error;
    }
    return result.getValue();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, type: TaskResponseDto })
  async create(@Body() dto: CreateTaskDto, @CurrentUser() user: any) {
    const result = await this.createTaskUseCase.execute({
      ...dto,
      creatorId: user.id,
      orgId: user.orgId,
    });

    if (result.isFailure) {
      throw result.error;
    }
    return result.getValue();
  }
}
