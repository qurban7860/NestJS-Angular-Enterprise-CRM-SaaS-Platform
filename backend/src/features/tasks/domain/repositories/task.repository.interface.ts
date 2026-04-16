import { Task } from '../entities/task.entity';

export interface ITaskRepository {
  findById(id: string): Promise<Task | null>;
  findByOrgId(orgId: string): Promise<Task[]>;
  save(task: Task): Promise<void>;
  findByAssignee(userId: string): Promise<Task[]>;
  delete(id: string): Promise<void>;
}
