/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, Post, Body, Param, Patch, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateBroadcastUseCase } from '../../application/use-cases/create-broadcast.use-case';
import { PrismaBroadcastRepository } from '../../infrastructure/repositories/prisma-broadcast.repository';
import { CurrentUser } from '../../../../core/presentation/decorators/current-user.decorator';
import { RequirePermissions } from '../../../rbac/presentation/decorators/require-permissions.decorator';
import { Public } from '../../../auth/presentation/decorators/public.decorator';

@ApiTags('Broadcasting')
@ApiBearerAuth()
@Controller('broadcasting')
export class BroadcastController {
  constructor(
    private readonly createBroadcastUseCase: CreateBroadcastUseCase,
    private readonly broadcastRepo: PrismaBroadcastRepository,
  ) {}

  @Post()
  @RequirePermissions('broadcast:write')
  @ApiOperation({ summary: 'Create and send a system-wide or org-wide broadcast' })
  async create(@CurrentUser() user: any, @Body() dto: any) {
    const result = await this.createBroadcastUseCase.execute({
      ...dto,
      senderId: user.id,
    });
    if (result.isFailure) throw new BadRequestException(result.error);
    return result.getValue();
  }

  @Get('active')
  @Public()
  @ApiOperation({ summary: 'Get active broadcasts for the current user' })
  async getActive(@CurrentUser() user: any) {
    return this.broadcastRepo.findActive(user?.orgId);
  }

  @Patch(':id/deactivate')
  @RequirePermissions('broadcast:write')
  @ApiOperation({ summary: 'Deactivate a broadcast message' })
  async deactivate(@Param('id') id: string) {
    return this.broadcastRepo.deactivate(id);
  }
}
