import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { Member } from './entities/member.entity';
import { User } from 'src/user/entities/user.entity';
import { Board } from 'src/board/entities/board.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * 멤버 관련 모듈 (MemberModule)
 * - 멤버 관련 서비스, 컨트롤러, DB 엔티티를 포함
 * - JwtModule을 직접 등록하여 JwtService 사용 가능
 */
@Module({
  imports: [
    ConfigModule.forRoot(), // 🔹 환경 변수 사용
    TypeOrmModule.forFeature([Member, User, Board]), // 🔹 TypeORM 엔티티 등록
    JwtModule.registerAsync({
      imports: [ConfigModule], // 🔹 ConfigModule에서 환경 변수 가져오기
      inject: [ConfigService], // 🔹 ConfigService 주입
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'), // 🔹 환경 변수에서 secret 가져오기
        // signOptions: { expiresIn: '1h' }, // 🔹 JWT 토큰 만료 시간 설정
      }),
    }),
  ],
  controllers: [MemberController], // 🔹 멤버 관련 컨트롤러 등록
  providers: [MemberService], // 🔹 멤버 서비스 등록
  exports: [MemberService], // 🔹 다른 모듈에서 MemberService 사용 가능하게 설정
})
export class MemberModule {}
