import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // 타입ORM 모듈 가져오기
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
