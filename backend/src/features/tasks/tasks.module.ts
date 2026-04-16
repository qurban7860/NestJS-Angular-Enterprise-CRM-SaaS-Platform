import { CreateTaskUseCase } from './application/use-cases/create-task.use-case';
import { ListTasksUseCase } from './application/use-cases/list-tasks.use-case';
import { PrismaTaskRepository } from './infrastructure/repositories/prisma-task.repository';
import { TasksController } from './presentation/controllers/tasks.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [NotificationsModule],
  controllers: [TasksController],
  providers: [
    CreateTaskUseCase,
    ListTasksUseCase,
    {
      provide: 'ITaskRepository',
      useClass: PrismaTaskRepository,
    },
  ],
  exports: [CreateTaskUseCase, ListTasksUseCase, 'ITaskRepository'],
})
export class TasksModule {}
