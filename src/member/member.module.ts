import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { User } from 'src/user/entities/user.entity';
import { Board } from 'src/board/entities/board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Member, User, Board])], // Member, User, Board 엔티티를 TypeORM 모듈에 등록
  providers: [MemberService], // MemberService 주입
  controllers: [MemberController], // MemberController 등록
  exports: [MemberService], // 다른 모듈에서도 MemberService 사용 가능하도록 설정
})
export class MemberModule {}
