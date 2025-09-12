// src/orbit-channel/orbit-channel.gateway.ts
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IChannelMessage } from './entities/channel-message.entity';

@WebSocketGateway({ cors: true }) // Allow connections from any origin
export class OrbitChannelGateway {
  @WebSocketServer()
  server: Server;

  /**
   * A client calls this when they open a channel screen.
   * We add their socket to a "room" named after the channelId.
   */
  @SubscribeMessage('joinChannel')
  handleJoinChannel(client: Socket, channelId: string): void {
    console.log(`Client ${client.id} joining channel ${channelId}`);
    client.join(channelId);
  }

  /**
   * A client calls this when they leave a channel screen.
   */
  @SubscribeMessage('leaveChannel')
  handleLeaveChannel(client: Socket, channelId: string): void {
    console.log(`Client ${client.id} leaving channel ${channelId}`);
    client.leave(channelId);
  }

  /**
   * This is NOT for clients to call.
   * Our SERVICE will call this method to broadcast a message.
   */
  broadcastMessageToChannel(channelId: string, message: IChannelMessage) {
    this.server.to(channelId).emit('newBroadcastMessage', message);
  }
}