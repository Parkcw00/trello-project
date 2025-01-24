import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  async use(req: any, res: any, next: Function) {    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('JWT 토큰을 찾을 수 없습니다!');
    }
    let token: string;
    try {
      token = authHeader.split(' ')[1];

      const payload = await this.jwtService.verify(token);
      req.user = payload; // 요청 user에 할당
      next();
    } catch (err) {
      throw new UnauthorizedException(`JWT 토큰이 올바르지 않습니다: ${token}`);
    }
  }
}

/*
@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // TypeORM 강의 참고
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        // .env 파일에 'JWT_SECRET_KEY' 키로 비밀키를 저장해두고 사용.
        secret: config.get<string>('JWT_SECRET_KEY'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
*/