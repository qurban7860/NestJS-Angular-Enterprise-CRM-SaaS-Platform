import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../core/application/base/use-case.base';
import { Result } from '../../../../core/domain/base/result';
import { PrismaBroadcastRepository } from '../../infrastructure/repositories/prisma-broadcast.repository';
import { BroadcastGateway } from '../../presentation/gateways/broadcast.gateway';

export interface CreateBroadcastDto {
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'URGENT';
  orgId?: string | null;
  expiresAt?: Date | null;
  senderId: string;
}

@Injectable()
export class CreateBroadcastUseCase implements UseCase<CreateBroadcastDto, any> {
  constructor(
    private readonly broadcastRepo: PrismaBroadcastRepository,
    private readonly broadcastGateway: BroadcastGateway,
  ) {}

  async execute(request: CreateBroadcastDto): Promise<Result<any>> {
    try {
      const broadcast = await this.broadcastRepo.create({
        title: request.title,
        message: request.message,
        type: request.type,
        orgId: request.orgId || null,
        expiresAt: request.expiresAt || null,
        senderId: request.senderId,
      });

      // Emit via Socket.io
      if (broadcast.orgId) {
        this.broadcastGateway.broadcastToOrg(broadcast.orgId, broadcast);
      } else {
        this.broadcastGateway.broadcastToAll(broadcast);
      }

      return Result.ok(broadcast);
    } catch (e) {
      return Result.fail(e.message);
    }
  }
}
