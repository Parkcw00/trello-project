import Joi from 'joi';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { BoardModule } from './board/board.module';
import { CommentModule } from './comment/comment.module';
import { ColumnModule } from './column/column.module'; // 컬럼 모듈 가져오기

import { CardModule } from './card/card.module';
import { AlarmModule } from './alarm/alarm.module';
import { MemberModule } from './member/member.module';
import { UserModule } from './user/user.module';
import { FileModule } from './file/file.module';
import { AuthModule } from './auth/auth.module';
import { ChecklistModule } from './checklist/checklist.module';

import { APP_GUARD } from '@nestjs/core'; // 추가
import { ScraperModule } from './scraper/scraper.module';

const typeOrmModuleOptions = {
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => ({
    namingStrategy: new SnakeNamingStrategy(),
    type: 'mysql',
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    database: configService.get('DB_NAME'),
    entities: [__dirname + '/**/entities/*.{ts,js}'], // 이곳에서 자신의 작업물의 엔티티 등록  -  경로 잘못??
    // entities: [
    //   process.env.NODE_ENV === 'production'
    //     ? 'dist/**/*.entity.js' // 배포 환경에서는 dist 폴더 사용
    //     : 'src/**/*.entity.ts',  // 개발 환경에서는 src 사용
    // ],
    /// 개발, dev 인
    synchronize: configService.get('DB_SYNC'), //true, // 기존 테이블이 있다면 자동으로 수정됨
    // migrationsRun: true, // 앱 실행 시 마이그레이션 적용

    logging: true,
  }),
  inject: [ConfigService],
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET_KEY: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_NAME: Joi.string().required(),
        DB_SYNC: Joi.boolean().required(),
      }),
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    BoardModule,
    CommentModule,
    ColumnModule,
    UserModule,
    MemberModule,
    AlarmModule,
    CardModule,
    FileModule,
    AuthModule,
    ChecklistModule,
    ScraperModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
