/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IJwtService } from '../../../auth/application/services/jwt.service.interface';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/notifications',
})
@Injectable()
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets = new Map<string, string[]>(); // userId -> socketIds[]

  constructor(
    @Inject('IJwtService') private readonly jwtService: IJwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token || client.handshake.headers.authorization;
      if (!token) {
        client.disconnect();
        return;
      }

      // Handshake token often starts with "Bearer " if from headers
      const cleanToken = token.replace('Bearer ', '');
      const payload = await this.jwtService.verify(cleanToken);

      const userId = payload.sub || payload.id;
      const orgId = payload.orgId;

      // Map socket to user
      client.data.user = payload;

      // Join rooms
      client.join(`user:${userId}`);
      client.join(`org:${orgId}`);

      this.logger.log(
        `Client connected: ${client.id} (User: ${userId}, Org: ${orgId})`,
      );
    } catch (e) {
      this.logger.error(`Connection failed: ${e.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Send notification to a specific user
   */
  sendToUser(userId: string, event: string, payload: any) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  /**
   * Send notification to all users in an organization
   */
  sendToOrg(orgId: string, event: string, payload: any) {
    this.server.to(`org:${orgId}`).emit(event, payload);
  }
}
