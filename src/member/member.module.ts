import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { User } from 'src/user/entities/user.entity';
import { Board } from 'src/board/entities/board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Member, User, Board])], // ✅ TypeORM 모듈 추가
  providers: [MemberService], // ✅ MemberService 주입
  controllers: [MemberController], // ✅ MemberController 등록
  exports: [
    MemberService,
    TypeOrmModule.forFeature([Member]), // ✅ Repository<Member>를 exports
  ],
})
export class MemberModule {}
