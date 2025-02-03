import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // ✅ 환경 변수 사용 추가
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';
import { MemberModule } from '../member/member.module';
import { Member } from '../member/entities/member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Member]),
    MemberModule,
    ConfigModule, // ✅ 환경 변수 모듈 추가
    JwtModule.registerAsync({
      // ✅ 환경 변수에서 secret 값 가져오기
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'), // ✅ secret 값 설정
        signOptions: { expiresIn: '1h' }, // 토큰 유효 시간 설정
      }),
    }),
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
