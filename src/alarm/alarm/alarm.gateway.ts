// src/alarm/alarm.gateway.ts
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';


@WebSocketGateway({ namespace: '/alarm' })
export class AlarmGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) { }

  handleConnection(client: Socket) {
    const token = client.handshake.query.token as string;
    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const decoded = this.jwtService.verify(token);
      const boardId = client.handshake.query.boardId;
      if (boardId && decoded.memberId) {
        client.join(`board-${boardId}`);
        console.log(`유저저 ${decoded.memberId}가 게시판 ${boardId}에 참여했습니다.`);
      } else {
        client.disconnect();
      }
    } catch (err) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`유저 ${client.id}가 웹소켓 서버에서 연결이 끊어졌습니다.`);
  }

}


// import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';

// // 여기서 cors를 설정하면 특정 도메인에게만 열어줄 수 있음 하지만 지금 상황은 도메인을 사용을 안하는 상황이기에 생략 가능.
// @WebSocketGateway({ namespace: '/alarm' }) // namespace를 통해 특정 경로에 대한 웹소켓 통신을 분리할 수 있다.
// // 웹소켓 연결 이벤트 처리리
// export class AlarmGateway implements OnGatewayConnection, OnGatewayDisconnect {

//   // 웹소켓 서버 인스턴스 생성
//   @WebSocketServer()// 웹소켓으로 접속한 클라이언트와 연결된 서버 인스턴스
//   server: Server; // 서버 인스턴스 생성

//   // 클라이언트 연결 이벤트 처리
//   handleConnection(client: Socket) {// 클라이언트가 웹소켓 서버에 연결되면 호출되는 이벤트 핸들러
//     const boardId = client.handshake.query.boardId; // 클라이언트에서 전달한 유저 아이디
//     console.log(`유저 ${client.id}가 board: ${boardId} 연결 되었습니다.`); // 로그 출력

//     // 유저 아이디가 있으면 해당 유저에게 소켓 방 참여
//     if (boardId) {
//       client.join(`board-${boardId}`); // 해당 유저에게 소켓 방 참여
//       console.log(`board: ${boardId} 소켓 방 참여하였습니다.`); // 로그 출력
//       // 해당 유저가 속한 방에만 메시지 전송
//       this.server.to(`board-${boardId}`).emit('userJoined', { userId: client.id, message: `유저:${client.id}가 참여했습니다.` });
//     }
//   }

//   // 클라이언트 연결 해제 이벤트 처리
//   handleDisconnect(client: Socket) { // 클라이언트가 웹소켓 서버에서 연결이 끊어지면 호출되는 이벤트 핸들러
//     const userId = client.handshake.query.userId; // 클라이언트에서 전달한 유저 아이디
//     console.log(`유저 ${userId} 연결 해제되었습니다.`); // 로그 출력
//     // 해당 유저가 속한 방에만 메시지 전송
//     this.server.to(`user-${userId}`).emit('userLeft', { userId: client.id, message: '사용자가 떠났습니다.' });
//   }


//   /*
//   여기서 참고로 클라이언트 연결 해제가 된다면 소켓 방에 있던 유저는 자동으로 방에서 제거 된다.
//   */


//   // 특정 소켓 방에 있는 모든 클라리언트에게 알림 메시지 전송 메서드
//   async sendAlarm(userId: number, alarmData: any) { // 알림 메시지를 전송하는 메서드
//     this.server.to(`user-${userId}`).emit(`새로운 소식`, alarmData); // 해당 유저가 있는 소켓 방에 알림 메시지 전송
//   }

// }