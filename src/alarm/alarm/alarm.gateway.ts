import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

// 여기서 cors를 설정하면 특정 도메인에게만 열어줄 수 있음 하지만 지금 상황은 도메인을 사용을 안하는 상황이기에 생략 가능.
@WebSocketGateway({ namespace: 'alarm' }) // namespace를 통해 특정 경로에 대한 웹소켓 통신을 분리할 수 있다.
export class AlarmGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(AlarmGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    this.logger.log(`클라이언트 연결: ${client.id} 유저 아이디: ${userId}`);

    if (userId) {
      client.join(`user-${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`클라이언트 연결 해제: ${client.id}`);
  }

  async sendAlarm(userId: number, alarmData: any) {
    this.server.to(`user-${userId}`).emit(`새로운 소식`, alarmData);
  }

}
