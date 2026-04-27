/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { UserResponseDto } from '../../application/dtos/auth.dto';
import { CurrentUser } from '../../../../core/presentation/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('auth/users')
export class UsersController {
  constructor(
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly createUserUseCase: CreateUserUseCase
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all users in the current organization' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  async findAll(@CurrentUser() user: { orgId: string }) {
    const result = await this.listUsersUseCase.execute(user.orgId);
    if (result.isFailure) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw result.error;
    }
    return result.getValue();
  }

  @Post()
  @ApiOperation({ summary: 'Add a new member to the organization' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async create(@CurrentUser() user: { orgId: string }, @Body() dto: any) {
    const result = await this.createUserUseCase.execute({ ...dto, orgId: user.orgId });
    if (result.isFailure) {
       throw new BadRequestException(result.error);
    }
    return result.getValue();
  }
}
