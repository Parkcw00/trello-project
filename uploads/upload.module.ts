import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService], // ✅ 서비스 등록
  exports: [UploadService], // ✅ 다른 모듈에서도 사용 가능하도록 내보내기
})
export class UploadModule { }
