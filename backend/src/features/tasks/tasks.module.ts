import { CreateTaskUseCase } from './application/use-cases/create-task.use-case';
import { ListTasksUseCase } from './application/use-cases/list-tasks.use-case';
import { UpdateTaskStatusUseCase } from './application/use-cases/update-task-status.use-case';
import { CreateTaskCommentUseCase } from './application/use-cases/create-comment.use-case';
import { ListTaskCommentsUseCase } from './application/use-cases/list-comments.use-case';
import { PrismaTaskRepository } from './infrastructure/repositories/prisma-task.repository';
import { PrismaTaskCommentRepository } from './infrastructure/repositories/prisma-task-comment.repository';
import { TasksController } from './presentation/controllers/tasks.controller';
import { TaskCommentsController } from './presentation/controllers/task-comments.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [NotificationsModule],
  controllers: [TasksController, TaskCommentsController],
  providers: [
    CreateTaskUseCase,
    ListTasksUseCase,
    UpdateTaskStatusUseCase,
    CreateTaskCommentUseCase,
    ListTaskCommentsUseCase,
    {
      provide: 'ITaskRepository',
      useClass: PrismaTaskRepository,
    },
    {
      provide: 'ITaskCommentRepository',
      useClass: PrismaTaskCommentRepository,
    },
  ],
  exports: [
    CreateTaskUseCase, 
    ListTasksUseCase, 
    UpdateTaskStatusUseCase, 
    'ITaskRepository',
    'ITaskCommentRepository'
  ],
})
export class TasksModule {}
