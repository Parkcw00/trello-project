import { Module } from '@nestjs/common'; // 모듈 데코레이터
import { TypeOrmModule } from '@nestjs/typeorm'; // 타입ORM 모듈 가져오기
import { ColumnEntity } from './entities/column.entity'; // 엔티티 가져오기
import { ColumnService } from './column.service'; // 서비스 가져오기
import { ColumnController } from './column.controller'; // 컨트롤러 가져오기

@Module({
  imports: [TypeOrmModule.forFeature([ColumnEntity])], // 리포지토리 주입 설정
  controllers: [ColumnController], // 컨트롤러 등록
  providers: [ColumnService], // 서비스 등록
})
export class ColumnModule {}
