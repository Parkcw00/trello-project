import { Module } from '@nestjs/common';
import { AlarmService } from './alarm.service';
import { AlarmController } from './alarm.controller';
import { AlarmGateway } from './alarm/alarm.gateway';

@Module({
  controllers: [AlarmController],
  providers: [AlarmService, AlarmGateway],
})
export class AlarmModule {}
