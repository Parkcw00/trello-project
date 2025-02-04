import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { Member } from './entities/member.entity';
import { User } from 'src/user/entities/user.entity';
import { Board } from 'src/board/entities/board.entity';
import { AuthMiddleware } from 'src/auth/auth.middleware'; // ✅ 미들웨어 추가
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Member, User, Board])], // ✅ TypeORM 모듈 추가
  providers: [MemberService], // ✅ MemberService 주입
  controllers: [MemberController], // ✅ MemberController 등록
  exports: [
    MemberService,
    TypeOrmModule.forFeature([Member]), // ✅ Repository<Member>를 exports
  ],
})
export class MemberModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(MemberController); // ✅ 미들웨어 적용
  }
}
