// src\auth\auth.middleware.ts
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // JWT 토큰을 생성하고 검증하는 데 사용하는 NestJS 서비스.
import { NextFunction, Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

// Request 인터페이스 확장
interface TokenRequest extends Request {
  user?: any;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  use(req: TokenRequest, res: Response, next: NextFunction) {
    console.log('jwt 검증2 :', req.headers.authorization);
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('토큰이 필요합니다.');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET_KEY'),
      });

      req.user = decoded; // 요청 객체에 사용자 정보 저장
      next();
    } catch (error) {
      throw new UnauthorizedException('만료되었거나 유효하지 않은 토큰입니다.');
    }
  }
}
