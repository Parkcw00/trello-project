import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { File } from './entities/file.entity'
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { Member } from 'src/member/entities/member.entity';
import { Board } from 'src/board/entities/board.entity';
import { Card } from 'src/card/entities/card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([File, Member, Board, Card])],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule { } 