import Joi from 'joi';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Board } from './board/entities/board.entity';
import { BoardModule } from './board/board.module';
import { CommentModule } from './comment/comment.module';
import { ColumnModule } from './column/column.module'; // 컬럼 모듈 가져오기
import { ColumnEntity } from './column/entities/column.entity'; // 엔티티 가져오기
import { CardModule } from './card/card.module';
import { AlarmModule } from './alarm/alarm.module';
import { MemberModule } from './member/member.module';
import { UserModule } from './user/user.module';
import { Card } from './card/entities/card.entity';
import { Comment } from './comment/entities/comment.entity';
import { Member } from './member/entities/member.entity';
import { User } from './user/entities/user.entity';
import { Alarm } from './alarm/entities/alarm.entity';

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
    entities: [ColumnEntity, Board, Card, Member, User, Comment, Alarm], // 이곳에서 자신의 작업물의 엔티티 등록
    synchronize: configService.get('DB_SYNC'),
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
