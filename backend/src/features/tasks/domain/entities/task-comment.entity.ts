import { Entity } from '../../../../core/domain/base/entity.base';
import { Result } from '../../../../core/domain/base/result';

interface TaskCommentProps {
  taskId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TaskComment extends Entity<TaskCommentProps> {
  private constructor(props: TaskCommentProps, id?: string) {
    super(props, id);
  }

  get taskId(): string { return this.props.taskId; }
  get authorId(): string { return this.props.authorId; }
  get content(): string { return this.props.content; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  public static create(props: Partial<TaskCommentProps>, id?: string): Result<TaskComment> {
    if (!props.taskId) return Result.fail<TaskComment>("taskId is required");
    if (!props.authorId) return Result.fail<TaskComment>("authorId is required");
    if (!props.content || props.content.trim().length === 0) {
      return Result.fail<TaskComment>("Comment content cannot be empty");
    }

    const comment = new TaskComment({
      taskId: props.taskId,
      authorId: props.authorId,
      content: props.content,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    }, id);

    return Result.ok<TaskComment>(comment);
  }

  public updateContent(newContent: string): void {
    this.props.content = newContent;
    this.props.updatedAt = new Date();
  }
}
