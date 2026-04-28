import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'broadcast',
})
@Injectable()
export class BroadcastGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(BroadcastGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers.authorization || client.handshake.auth.token;
      const token = authHeader?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token. Disconnecting.`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      
      client.data.user = payload;
      
      // Join system-wide room
      await client.join('system');
      
      // Join organization-specific room
      if (payload.orgId) {
        const orgRoom = `org_${payload.orgId}`;
        await client.join(orgRoom);
        this.logger.log(`Client ${client.id} joined rooms: system, ${orgRoom}`);
      } else {
        this.logger.log(`Client ${client.id} joined room: system`);
      }

      this.logger.log(`Client authenticated: ${client.id} (${payload.email})`);
    } catch (e) {
      this.logger.error(`Connection Auth Failed for ${client.id}: ${e.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Broadcast to all connected clients
   */
  broadcastToAll(data: any) {
    this.logger.log(`Broadcasting SYSTEM-WIDE message: ${data.title}`);
    this.server.emit('broadcast:received', data);
  }

  /**
   * Broadcast only to a specific organization
   */
  broadcastToOrg(orgId: string, data: any) {
    const orgRoom = `org_${orgId}`;
    this.logger.log(`Broadcasting to ORG ${orgId}: ${data.title}`);
    this.server.to(orgRoom).emit('broadcast:received', data);
  }
}
