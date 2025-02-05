import { Module } from '@nestjs/common';
import { AlarmService } from './alarm.service';
import { AlarmController } from './alarm.controller';
import { AlarmGateway } from './alarm/alarm.gateway';
import { AlarmListener } from './alarm/alarm.listener';
import { JwtModule } from '@nestjs/jwt';
import { CardService } from 'src/card/card.service';
import { ColumnModule } from 'src/column/column.module';
import { CardModule } from 'src/card/card.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [JwtModule.register({}), ColumnModule, CardModule, EventEmitterModule.forRoot()],
  controllers: [AlarmController],
  providers: [AlarmService, AlarmGateway, AlarmListener, CardService],
})


export class AlarmModule { }
