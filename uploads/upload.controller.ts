import { Controller, Post, Get, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { S3 } from 'aws-sdk';
import { awsConfig } from '../aws.config';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadFile(file);
  }

  @Get(':filename')
  getCDNFile(@Param('filename') filename: string) {
    const cloudFrontUrl = process.env.AWS_CLOUDFRONT_URL?.replace(/^https?:\/\//, '');
    return { url: `https://${cloudFrontUrl}/${filename}` };
  }

  @Get() // ✅ JSON 형식으로 업로드된 파일 리스트 반환
  async listFiles() {
    const s3 = new S3({
      accessKeyId: awsConfig.accessKeyId,
      secretAccessKey: awsConfig.secretAccessKey,
      region: awsConfig.region,
    });

    const params = { Bucket: awsConfig.bucketName };
    const data = await s3.listObjectsV2(params).promise();

    return data.Contents.map(file => ({
      filename: file.Key,
      url: `https://${process.env.AWS_CLOUDFRONT_URL?.replace(/^https?:\/\//, '')}/${file.Key}`,
    }));
  }
}
