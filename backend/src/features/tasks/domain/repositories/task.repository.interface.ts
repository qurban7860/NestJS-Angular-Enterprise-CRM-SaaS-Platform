import { Task } from '../entities/task.entity';

export interface ITaskRepository {
  findById(id: string): Promise<Task | null>;
  findByOrgId(orgId: string): Promise<Task[]>;
  save(task: Task): Promise<void>;
  findByAssigneeId(orgId: string, assigneeId: string): Promise<Task[]>;
  findByContactId(orgId: string, contactId: string): Promise<Task[]>;
  findByDealId(orgId: string, dealId: string): Promise<Task[]>;
  delete(id: string): Promise<void>;
}
