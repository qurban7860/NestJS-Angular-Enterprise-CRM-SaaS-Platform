/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/only-throw-error */
import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  Query,
  Delete,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateTaskUseCase } from '../../application/use-cases/create-task.use-case';
import { ListTasksUseCase } from '../../application/use-cases/list-tasks.use-case';
import { GetTaskUseCase } from '../../application/use-cases/get-task.use-case';
import { UpdateTaskUseCase } from '../../application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from '../../application/use-cases/delete-task.use-case';
import { UpdateTaskStatusUseCase } from '../../application/use-cases/update-task-status.use-case';
import {
  CreateTaskDto,
  TaskResponseDto,
  TaskFiltersDto,
  UpdateTaskDto,
} from '../../application/dtos/task.dto';
import { CurrentUser } from '../../../../core/presentation/decorators/current-user.decorator';
import { CsvExportService } from '../../../../core/application/services/csv-export.service';
import type { Response } from 'express';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly listTasksUseCase: ListTasksUseCase,
    private readonly getTaskUseCase: GetTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
    private readonly updateTaskStatusUseCase: UpdateTaskStatusUseCase,
    private readonly csvExportService: CsvExportService,
  ) {}

  @Get('export')
  @ApiOperation({ summary: 'Export tasks to CSV' })
  async exportCsv(
    @CurrentUser() user: any,
    @Query() filters: TaskFiltersDto,
    @Res() res: Response,
  ) {
    const result = await this.listTasksUseCase.execute({
      orgId: user.orgId,
      filters,
    });
    if (result.isFailure) {
      throw result.error;
    }
    const tasks = result.getValue();

    const csvData = tasks.map((t) => ({
      ID: t.id,
      Title: t.title,
      Status: t.status,
      Priority: t.priority,
      DueDate: t.dueDate ? t.dueDate.toISOString() : '',
      CreatedAt: t.createdAt.toISOString(),
    }));

    const csvString = this.csvExportService.generateCsv(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=tasks.csv');
    res.send(csvString);
  }

  @Get()
  @ApiOperation({
    summary:
      'List all tasks for the current organization with optional filters',
  })
  @ApiResponse({ status: 200, type: [TaskResponseDto] })
  async findAll(@CurrentUser() user: any, @Query() filters: TaskFiltersDto) {
    const result = await this.listTasksUseCase.execute({
      orgId: user.orgId,
      filters,
    });
    if (result.isFailure) {
      throw result.error;
    }
    return result.getValue();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific task' })
  @ApiResponse({ status: 200, type: TaskResponseDto })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.getTaskUseCase.execute({ id, orgId: user.orgId });
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

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update a task status' })
  @ApiResponse({ status: 200, type: TaskResponseDto })
  async updateStatus(
    @Param('id') taskId: string,
    @Body() dto: { status: string },
    @CurrentUser() user: any,
  ) {
    const result = await this.updateTaskStatusUseCase.execute({
      taskId,
      status: dto.status as any,
      orgId: user.orgId,
    });

    if (result.isFailure) {
      throw result.error;
    }
    return result.getValue();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing task' })
  @ApiResponse({ status: 200, type: TaskResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.updateTaskUseCase.execute({
      ...dto,
      id,
      orgId: user.orgId,
    });

    if (result.isFailure) {
      throw result.error;
    }
    return result.getValue();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.deleteTaskUseCase.execute({
      id,
      orgId: user.orgId,
    });

    if (result.isFailure) {
      throw result.error;
    }
    return;
  }
}
