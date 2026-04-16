import { Controller, Post, Body, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateTaskCommentUseCase } from '../../application/use-cases/create-comment.use-case';
import { ListTaskCommentsUseCase } from '../../application/use-cases/list-comments.use-case';
import { CreateCommentDto, CommentResponseDto } from '../../application/dtos/comment.dto';
import { CurrentUser } from '../../../../core/presentation/decorators/current-user.decorator';

@ApiTags('Task Comments')
@ApiBearerAuth()
@Controller('tasks/:taskId/comments')
export class TaskCommentsController {
  constructor(
    private readonly createCommentUseCase: CreateTaskCommentUseCase,
    private readonly listCommentsUseCase: ListTaskCommentsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all comments for a task' })
  @ApiResponse({ status: 200, type: [CommentResponseDto] })
  async findAll(@Param('taskId', ParseUUIDPipe) taskId: string) {
    const result = await this.listCommentsUseCase.execute(taskId);
    if (result.isFailure) {
      throw result.error;
    }
    return result.getValue();
  }

  @Post()
  @ApiOperation({ summary: 'Add a comment to a task' })
  @ApiResponse({ status: 201, type: CommentResponseDto })
  async create(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.createCommentUseCase.execute({
      taskId,
      authorId: user.id,
      content: dto.content,
    });

    if (result.isFailure) {
      throw result.error;
    }
    return result.getValue();
  }
}
