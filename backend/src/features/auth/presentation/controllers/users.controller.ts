import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';
import { UserResponseDto } from '../../application/dtos/auth.dto';
import { CurrentUser } from '../../../../core/presentation/decorators/current-user.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../rbac/presentation/guards/permissions.guard';
import { RequirePermissions } from '../../../rbac/presentation/decorators/require-permissions.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('auth/users')
export class UsersController {
  constructor(
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Get()
  @RequirePermissions('team:read')
  @ApiOperation({ summary: 'List all users in the current organization' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  async findAll(@CurrentUser() user: { orgId: string }) {
    const result = await this.listUsersUseCase.execute(user.orgId);
    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }
    return result.getValue();
  }

  @Post()
  @RequirePermissions('team:write')
  @ApiOperation({ summary: 'Add a new member to the organization' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async create(@CurrentUser() user: { orgId: string }, @Body() dto: any) {
    const result = await this.createUserUseCase.execute({
      ...dto,
      orgId: user.orgId,
    });
    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result.getValue();
  }

  @Patch(':id')
  @RequirePermissions('team:write')
  @ApiOperation({ summary: 'Update a team member' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async update(
    @CurrentUser() user: { orgId: string; role: string },
    @Param('id') userId: string,
    @Body() dto: any,
  ) {
    const result = await this.updateUserUseCase.execute({
      ...dto,
      userId,
      orgId: user.orgId,
      currentUserRole: user.role,
    });
    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result.getValue();
  }

  @Delete(':id')
  @RequirePermissions('team:write')
  @ApiOperation({ summary: 'Remove a team member' })
  @ApiResponse({ status: 200 })
  async remove(
    @CurrentUser() user: { orgId: string; role: string },
    @Param('id') userId: string,
  ) {
    const result = await this.deleteUserUseCase.execute({
      userId,
      orgId: user.orgId,
      currentUserRole: user.role,
    });
    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }
  }
}
