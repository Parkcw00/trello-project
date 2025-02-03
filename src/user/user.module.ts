// user.module.ts
import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt'; // WT 관련 기능을 제공하는 모듈. 이를 imports 배열에 추가하여 사용
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthMiddleware } from '../auth/auth.middleware'; // 분리된 미들웨어

//import { AuthModule } from '../auth/auth.module'; // 추가
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET_KEY'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, JwtModule],
})
// export class UserModule {}
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'user/login', method: RequestMethod.POST },
        { path: 'user/signup', method: RequestMethod.POST },
        { path: 'user/refresh', method: RequestMethod.GET },
        { path: 'user/users', method: RequestMethod.GET },
      )
      .forRoutes(UserController);
  }
}
