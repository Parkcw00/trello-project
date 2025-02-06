import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { Board } from 'src/board/entities/board.entity';
import { ColumnEntity } from 'src/column/entities/column.entity';
import { Member } from 'src/member/entities/member.entity';
import { BoardModule } from 'src/board/board.module';
import { MemberModule } from 'src/member/member.module';
import { ColumnModule } from 'src/column/column.module';
import { RedisService } from '../redis/redis.service';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    TypeOrmModule.forFeature([Card, Board, ColumnEntity, Member]),
    BoardModule,
    MemberModule,
    ColumnModule,
    RedisModule,
  ],
  exports: [TypeOrmModule],
  controllers: [CardController],
  providers: [CardService, RedisService],
})

export class CardModule { }
