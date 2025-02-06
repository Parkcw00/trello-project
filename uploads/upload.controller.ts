import { Controller, Post, Get, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
// NestJS의 주요 데코레이터 및 유틸리티를 가져옴
import { FileInterceptor } from '@nestjs/platform-express';
// Multer를 기반으로 하는 파일 업로드 미들웨어를 사용하기 위한 인터셉터
import { UploadService } from './upload.service';
// 파일 업로드 관련 비즈니스 로직을 처리하는 서비스 계층을 불러옴
import { S3 } from 'aws-sdk';
// AWS SDK에서 제공하는 S3 클라이언트를 사용하여 AWS S3와 상호작용
import { awsConfig } from '../aws.config';
// 프로젝트 내 AWS 관련 설정을 가져와서 S3 버킷 정보 및 CloudFront URL을 사용

@Controller('upload') // 업로드 관련 API 엔드포인트 설정 (루트 경로: /upload)
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  /**
   * 파일 업로드 API
   * - 클라이언트가 파일을 업로드하면 S3에 저장하고, 업로드된 URL을 반환함.
   * - `POST /upload`
   * - 요청 형식: `multipart/form-data`
   */
  @Post()
  @UseInterceptors(FileInterceptor('file')) // Multer를 사용하여 파일 업로드 처리
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadFile(file); // 서비스 계층에서 파일을 S3에 업로드
  }

  /**
   * 특정 파일의 CloudFront URL 반환 API
   * - `GET /upload/:filename`
   * - S3에 저장된 파일명을 입력하면 CloudFront URL을 생성하여 반환함.
   */
  @Get(':filename')
  getCDNFile(@Param('filename') filename: string) {
    const cloudFrontUrl = process.env.AWS_CLOUDFRONT_URL?.replace(/^https?:\/\//, ''); // CloudFront URL에서 중복된 `https://` 제거
    return { url: `https://${cloudFrontUrl}/${filename}` }; // 최종적으로 클라이언트가 접근할 수 있는 URL 반환
  }

  /**
   * 업로드된 파일 리스트 반환 API
   * - `GET /upload`
   * - S3 버킷에 저장된 모든 파일 리스트를 가져와서 JSON 형식으로 반환함.
   */
  @Get()
  async listFiles() {
    const s3 = new S3({
      accessKeyId: awsConfig.accessKeyId, // AWS S3 접근을 위한 액세스 키
      secretAccessKey: awsConfig.secretAccessKey, // AWS S3 접근을 위한 시크릿 키
      region: awsConfig.region, // AWS 리전 설정
    });

    const params = { Bucket: awsConfig.bucketName }; // S3에서 파일 목록을 가져올 버킷 지정
    const data = await s3.listObjectsV2(params).promise(); // S3 버킷에서 파일 리스트 가져오기

    return data.Contents.map(file => ({
      filename: file.Key, // S3에서 저장된 파일명
      url: `https://${process.env.AWS_CLOUDFRONT_URL?.replace(/^https?:\/\//, '')}/${file.Key}`, // CloudFront URL 반환
    }));
  }
}
