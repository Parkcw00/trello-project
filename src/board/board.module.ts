import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { Board } from './entities/board.entity';
import { Member } from 'src/member/entities/member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board, Member])],
  providers: [BoardService],
  controllers: [BoardController],
})
export class BoardModule {}
