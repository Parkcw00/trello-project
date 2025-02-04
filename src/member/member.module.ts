import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { Member } from './entities/member.entity';
import { User } from 'src/user/entities/user.entity';
import { Board } from 'src/board/entities/board.entity';
import { AuthModule } from 'src/auth/auth.module'; // ✅ AuthModule 추가

@Module({
  imports: [
    TypeOrmModule.forFeature([Member, User, Board]),
    AuthModule, // ✅ AuthModule을 import하여 JwtModule 포함
  ],
  providers: [MemberService],
  controllers: [MemberController],
  exports: [MemberService, TypeOrmModule.forFeature([Member])],
})
export class MemberModule {} // ✅ `configure()` 삭제 (글로벌 미들웨어로 이동)
