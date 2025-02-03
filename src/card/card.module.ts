import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { User } from 'src/user/entities/user.entity';
import { Board } from 'src/board/entities/board.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(), // 🔹 환경 변수 사용 (.env 파일 적용)
    TypeOrmModule.forFeature([Card, User, Board]), // 🔹 TypeORM을 사용하여 카드, 사용자, 보드 엔티티 등록
    JwtModule.registerAsync({
      imports: [ConfigModule], // 🔹 환경 변수 모듈 사용
      inject: [ConfigService], // 🔹 ConfigService를 주입하여 환경 변수 사용
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'), // 🔹 JWT 서명 키를 환경 변수에서 가져오기
        // signOptions: { expiresIn: '1h' }, // 🔹 토큰 만료 시간 설정 (필요하면 주석 해제)
      }),
    }),
  ],
  controllers: [CardController], // 🔹 카드 API 컨트롤러 등록
  providers: [CardService], // 🔹 카드 비즈니스 로직 서비스 등록
  exports: [CardService], // 🔹 다른 모듈에서 CardService를 사용할 수 있도록 내보냄
})
export class CardModule {}
