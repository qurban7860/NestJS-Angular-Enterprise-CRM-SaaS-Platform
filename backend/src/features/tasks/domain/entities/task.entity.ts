/* eslint-disable prettier/prettier */
import { Entity } from '../../../../core/domain/base/entity.base';
import { Result } from '../../../../core/domain/base/result';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface TaskProps {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  orgId: string;
  assigneeId?: string | null;
  creatorId: string;
  dueDate?: Date | null;
  completedAt?: Date | null;
  contactId?: string | null;
  dealId?: string | null;
  tags: string[];
  isDeleted: boolean;
  version: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Task extends Entity<TaskProps> {
  private constructor(props: TaskProps, id?: string) {
    super(props, id);
  }

  get title(): string { return this.props.title; }
  get description(): string | undefined | null { return this.props.description; }
  get status(): TaskStatus { return this.props.status; }
  get priority(): TaskPriority { return this.props.priority; }
  get orgId(): string { return this.props.orgId; }
  get assigneeId(): string | null | undefined { return this.props.assigneeId; }
  get creatorId(): string { return this.props.creatorId; }
  get dueDate(): Date | null | undefined { return this.props.dueDate; }
  get completedAt(): Date | null | undefined { return this.props.completedAt; }
  get contactId(): string | null | undefined { return this.props.contactId; }
  get dealId(): string | null | undefined { return this.props.dealId; }
  get tags(): string[] { return this.props.tags; }
  get isDeleted(): boolean { return this.props.isDeleted; }
  get version(): number { return this.props.version; }
  get createdAt(): Date | undefined { return this.props.createdAt; }
  get updatedAt(): Date | undefined { return this.props.updatedAt; }

  public static create(props: TaskProps, id?: string): Result<Task> {
    if (!props.title) return Result.fail<Task>("Task title is required");

    return Result.ok<Task>(new Task({
      ...props,
      status: props.status ?? 'TODO',
      priority: props.priority ?? 'MEDIUM',
      tags: props.tags ?? [],
      version: props.version ?? 0,
      isDeleted: props.isDeleted ?? false,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    }, id));
  }

  public updateStatus(status: TaskStatus): void {
    this.props.status = status;
    if (status === 'DONE') {
      this.props.completedAt = new Date();
    } else {
      this.props.completedAt = undefined;
    }
    this.props.updatedAt = new Date();
  }

  public assign(userId: string): void {
    this.props.assigneeId = userId;
    this.props.updatedAt = new Date();
  }

  public update(props: Partial<TaskProps>): void {
    if (props.title !== undefined) this.props.title = props.title;
    if (props.description !== undefined) this.props.description = props.description;
    if (props.status !== undefined) this.updateStatus(props.status);
    if (props.priority !== undefined) this.props.priority = props.priority;
    if (props.assigneeId !== undefined) this.props.assigneeId = props.assigneeId;
    if (props.dueDate !== undefined) this.props.dueDate = props.dueDate;
    if (props.contactId !== undefined) this.props.contactId = props.contactId;
    if (props.dealId !== undefined) this.props.dealId = props.dealId;
    if (props.tags !== undefined) this.props.tags = props.tags;
    
    this.props.updatedAt = new Date();
  }

  public delete(): void {
    this.props.isDeleted = true;
    this.props.updatedAt = new Date();
  }
}
