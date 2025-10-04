// In src/message/scheduling.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SocketIoGateway } from 'src/chat/socket_io/socket_io.gateway';
import { IMessage } from 'src/chat/message/entities/message.entity';
import { MessageStatusType } from 'src/core/utils/enums';

@Injectable()
export class SchedulingService {
  private readonly logger = new Logger(SchedulingService.name);

  constructor(
    @InjectModel('Message') private readonly messageModel: Model<IMessage>,
    private readonly socketGateway: SocketIoGateway, // Inject your gateway
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledMessages() {
    this.logger.log('Checking for scheduled messages to send...');

    const now = new Date();

    // 1. Find all messages that are scheduled and due
    const dueMessages = await this.messageModel.find({
      status: MessageStatusType.SCHEDULED,
      scheduledAt: { $lte: now },
    });

    if (dueMessages.length === 0) {
      return; // No messages to send
    }

    // 2. Loop through and send each message
    for (const message of dueMessages) {
      try {
        // 3. Emit message via WebSocket to the correct room
        this.socketGateway.io.to(message.rId.toString()).emit('newMessage', message);

        // 4. IMPORTANT: Update status to prevent sending it again
        await this.messageModel.updateOne(
          { _id: message._id },
          { $set: { status: MessageStatusType.Deliver } }
        );

        this.logger.log(`Sent scheduled message ID: ${message._id}`);
      } catch (error) {
        this.logger.error(`Failed to send message ID: ${message._id}`, error);
      }
    }
  }
}