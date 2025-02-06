import { Module } from '@nestjs/common'; // 모듈 데코레이터
import { TypeOrmModule } from '@nestjs/typeorm'; // 타입ORM 모듈 가져오기
import { ColumnEntity } from './entities/column.entity'; // 엔티티 가져오기
import { ColumnService } from './column.service'; // 서비스 가져오기
import { ColumnController } from './column.controller'; // 컨트롤러 가져오기
import { BoardModule } from 'src/board/board.module';
import { Board } from 'src/board/entities/board.entity';
import { Member } from 'src/member/entities/member.entity';
import { MemberModule } from 'src/member/member.module';
import { RedisService } from '../redis/redis.service';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    TypeOrmModule.forFeature([ColumnEntity, Board, Member]),
    BoardModule,
    MemberModule,
    RedisModule,
  ],
  exports: [TypeOrmModule],
  controllers: [ColumnController], // 컨트롤러 등록
  providers: [ColumnService, RedisService], // 서비스 등록
})
export class ColumnModule { }
