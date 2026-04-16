/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import { UserResponseDto } from '../../application/dtos/auth.dto';
import { CurrentUser } from '../../../../core/presentation/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly listUsersUseCase: ListUsersUseCase) {}

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
}
