// comment.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from './entities/comment.entity';
import { Member } from 'src/member/entities/member.entity';
import { Board } from 'src/board/entities/board.entity'; // Board 엔티티 추가
import { Card } from 'src/card/entities/card.entity'; // Card 엔티티 추가
import { CardModule } from 'src/card/card.module'; // CardModule 임포트

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Member, Board, Card]), // Card 엔티티 추가
    CardModule, // CardModule 추가
  ],
  providers: [CommentService],
  controllers: [CommentController],
})
export class CommentModule {}
