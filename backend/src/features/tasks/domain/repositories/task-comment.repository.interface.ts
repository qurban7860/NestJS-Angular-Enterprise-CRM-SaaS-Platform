import { TaskComment } from '../entities/task-comment.entity';

export interface ITaskCommentRepository {
  findById(id: string): Promise<TaskComment | null>;
  findByTaskId(taskId: string): Promise<TaskComment[]>;
  save(comment: TaskComment): Promise<void>;
  delete(id: string): Promise<void>;
}
