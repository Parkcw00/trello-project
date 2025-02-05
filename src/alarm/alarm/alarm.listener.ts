import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AlarmGateway } from './alarm.gateway';

@Injectable()
export class AlarmListener {
  constructor(private readonly alarmGateway: AlarmGateway) { }
  @OnEvent('card.created')
  handleCardCreatedEvent(payload: { boardId: number; cardData: any }) {

    // 이벤트가 발생했을 때 실행할 로직을 여기에 작성합니다.
    console.log('카드 생성 이벤트 발생:', payload);
    // 알람을 생성하거나 다른 작업을 수행할 수 있습니다.
    this.alarmGateway.server.to(`board-${payload.boardId}`).emit('cardCreated', payload.cardData);

  }
}
