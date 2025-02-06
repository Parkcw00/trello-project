// src/alarm/alarm.gateway.ts
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';


@WebSocketGateway({ namespace: '/alarm', cors: { origin: '*' } })
export class AlarmGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) { }

  handleConnection(client: Socket) {
    console.log('클라이언트 연결 시도:', client.id);
    const token = client.handshake.query.token as string;



    try {

      const boardId = client.handshake.query.boardId;

      if (boardId) {
        client.join(`board-${boardId}`);
        console.log(`유저 ${client.id}가 게시판 ${boardId}에 참여했습니다.`);
      } else {
        client.disconnect();
      }


    } catch (err) {
      console.log('토큰 검증 실패:', err);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`유저 ${client.id}가 웹소켓 서버에서 연결이 끊어졌습니다.`);
  }

}

