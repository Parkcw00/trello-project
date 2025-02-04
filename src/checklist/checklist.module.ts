import { Module } from '@nestjs/common';
import { ChecklistService } from './checklist.service';
import { ChecklistController } from './checklist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Checklist } from './entities/checklist.entity';
import { Member } from 'src/member/entities/member.entity';
import { Board } from 'src/board/entities/board.entity';
import { Card } from 'src/card/entities/card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Checklist, Member, Board, Card])],
  controllers: [ChecklistController],
  providers: [ChecklistService],
})
export class ChecklistModule {}
