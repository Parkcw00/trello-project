import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AlarmGateway } from './alarm.gateway';

@Injectable()
export class AlarmListener {
  constructor(private readonly alarmGateway: AlarmGateway) { }
  @OnEvent('card.created')
  handleCardCreatedEvent(payload: { boardId: number; cardData: any }) {
    console.log('서버에서 카드 생성 이벤트 발생:', payload); // 이벤트 발행 로그
    // 방 이름과 이벤트 데이터 확인

    const roomName = `board-${payload.boardId}`;
    console.log(`이벤트를 전송할 방: ${roomName}`);
    console.log('이벤트 데이터:', payload.cardData);

    this.alarmGateway.server.to(`board-${payload.boardId}`).emit('cardCreated', payload.cardData);

  }

  @OnEvent('card.updated')
  handleCardUpdatedEvent(payload: { boardId: number; cardData: any }) {
    console.log('서버에서 카드 업데이트 이벤트 발생:', payload); // 이벤트 발행 로그

    // 방 이름과 이벤트 데이터 확인
    const roomName = `board-${payload.boardId}`;
    console.log(`이벤트를 전송할 방: ${roomName}`);
    console.log('이벤트 데이터:', payload.cardData);

    // 이벤트 전송
    this.alarmGateway.server.to(roomName).emit('cardUpdated', payload.cardData);
  }

  @OnEvent('column.created')
  handleColumnCreatedEvent(payload: { boardId: number; columnData: any }) {
    console.log('서버에서 컬럼 생성 이벤트 발생:', payload); // 이벤트 발행 로그

    // 방 이름과 이벤트 데이터 확인
    const roomName = `board-${payload.boardId}`;
    console.log(`이벤트를 전송할 방: ${roomName}`);
    console.log('이벤트 데이터:', payload.columnData);

    // 이벤트 전송
    this.alarmGateway.server.to(roomName).emit('columnCreated', payload.columnData);
  }

  @OnEvent('column.updated')
  handleColumnUpdateEvent(payload: { boardId: number; columnData: any }) {
    console.log('서버에서 컬럼 업데이트 이벤트 발생:', payload); // 이벤트 발행 로그


    // 방 이름과 이벤트 데이터 확인
    const roomName = `board-${payload.boardId}`;
    console.log(`이벤트를 전송할 방: ${roomName}`);
    console.log('이벤트 데이터:', payload.columnData);

    // 이벤트 전송
    this.alarmGateway.server.to(roomName).emit('columnUpdated', payload.columnData);
  }

  @OnEvent('comment.created')
  handleCommentCreatedEvent(payload: { boardId: number; commentData: any }) {
    console.log('서버에서 댓글 생성 이벤트 발생:', payload); // 이벤트 발행 로그


    // 방 이름과 이벤트 데이터 확인
    const roomName = `board-${payload.boardId}`;
    console.log(`이벤트를 전송할 방: ${roomName}`);
    console.log('이벤트 데이터:', payload.commentData);

    // 이벤트 전송
    this.alarmGateway.server.to(roomName).emit('commentCreated', payload.commentData);
  }

  @OnEvent('comment.updated')
  handleCommentUpdateEvent(payload: { boardId: number; commentData: any }) {
    console.log('서버에서 댓글 업데이트 이벤트 발생:', payload); // 이벤트 발행 로그


    // 방 이름과 이벤트 데이터 확인
    const roomName = `board-${payload.boardId}`;
    console.log(`이벤트를 전송할 방: ${roomName}`);
    console.log('이벤트 데이터:', payload.commentData);

    // 이벤트 전송
    this.alarmGateway.server.to(roomName).emit('commentUpdated', payload.commentData);
  }



}
