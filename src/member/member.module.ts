import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { Member } from './entities/member.entity';
import { User } from 'src/user/entities/user.entity';
import { Board } from 'src/board/entities/board.entity';
import { AuthModule } from 'src/auth/auth.module'; // AuthModule 추가 (JWT 인증 관련 모듈)

// `MemberModule`은 `MemberService`와 `MemberController`를 관리하는 모듈입니다.
@Module({
  imports: [
    // TypeORM을 이용하여 `Member`, `User`, `Board` 엔티티를 사용 가능하게 설정
    TypeOrmModule.forFeature([Member, User, Board]),

    // `AuthModule`을 import하여 JWT 인증 관련 기능을 사용할 수 있도록 설정
    AuthModule,
  ],
  providers: [
    MemberService, // `MemberService`를 제공 (의존성 주입)
  ],
  controllers: [
    MemberController, // `MemberController`를 등록하여 HTTP 요청을 처리할 수 있도록 함
  ],
  exports: [
    MemberService, // `MemberService`를 다른 모듈에서 사용할 수 있도록 export
    TypeOrmModule.forFeature([Member]), // `MemberRepository`도 export하여 다른 모듈에서 접근 가능
  ],
})
export class MemberModule {} // `MemberModule`은 NestJS의 모듈 시스템을 활용하여 멤버 관련 기능을 캡슐화함.
