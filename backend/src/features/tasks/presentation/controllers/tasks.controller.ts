/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
  UseGuards,
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
import { PermissionsGuard } from '../../../rbac/presentation/guards/permissions.guard';
import { RequirePermissions } from '../../../rbac/presentation/decorators/require-permissions.decorator';
import type { Response } from 'express';

import { PlanLimitsService } from '../../../../core/infrastructure/billing/plan-limits.service';
import { BusinessException } from '../../../../core/application/exceptions/business.exception';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(PermissionsGuard)
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
    private readonly limitsService: PlanLimitsService,
  ) {}

  @Get('export')
  @RequirePermissions('tasks:read')
  @ApiOperation({ summary: 'Export tasks to CSV' })
  async exportCsv(
    @CurrentUser() user: any,
    @Query() filters: TaskFiltersDto,
    @Res() res: Response,
  ) {
    await this.limitsService.checkLimit(user.orgId, 'hasExport');
    const result = await this.listTasksUseCase.execute({
      orgId: user.orgId,
      filters,
    });
    if (result.isFailure) {
      throw new BusinessException(result.error!);
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
  @RequirePermissions('tasks:read')
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
      throw new BusinessException(result.error!);
    }
    return result.getValue();
  }

  @Get(':id')
  @RequirePermissions('tasks:read')
  @ApiOperation({ summary: 'Get a specific task' })
  @ApiResponse({ status: 200, type: TaskResponseDto })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.getTaskUseCase.execute({ id, orgId: user.orgId });
    if (result.isFailure) {
      throw new BusinessException(result.error!);
    }
    return result.getValue();
  }

  @Post()
  @RequirePermissions('tasks:write')
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, type: TaskResponseDto })
  async create(@Body() dto: CreateTaskDto, @CurrentUser() user: any) {
    await this.limitsService.checkLimit(user.orgId, 'maxTasks');
    const result = await this.createTaskUseCase.execute({
      ...dto,
      creatorId: user.id,
      orgId: user.orgId,
    });

    if (result.isFailure) {
      throw new BusinessException(result.error!);
    }
    return result.getValue();
  }

  @Patch(':id/status')
  @RequirePermissions('tasks:write')
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
      throw new BusinessException(result.error!);
    }
    return result.getValue();
  }

  @Patch(':id')
  @RequirePermissions('tasks:write')
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
      userId: user.id,
    });

    if (result.isFailure) {
      throw new BusinessException(result.error!);
    }
    return result.getValue();
  }

  @Delete(':id')
  @RequirePermissions('tasks:delete')
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
