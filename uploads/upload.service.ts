import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { awsConfig } from '../aws.config';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
  accessKeyId: awsConfig.accessKeyId,
  secretAccessKey: awsConfig.secretAccessKey,
  region: awsConfig.region,
});

@Injectable()
export class UploadService {
  async uploadFile(file: Express.Multer.File) {
    const uniqueFileName = `${uuidv4()}-${file.originalname}`;

    const params = {
      Bucket: awsConfig.bucketName,
      Key: uniqueFileName,
      Body: file.buffer,
      ContentType: file.mimetype, // ✅ MIME 타입 추가 (브라우저에서 직접 보기 가능)
      ACL: 'public-read',
    };

    const uploadResult = await s3.upload(params).promise();

    const cloudFrontUrl = awsConfig.cloudFrontUrl.replace(/^https?:\/\//, ''); // ✅ 중복 문제 해결

    return {
      s3Url: uploadResult.Location, // ✅ S3 URL 반환
      cdnUrl: `https://${cloudFrontUrl}/${uniqueFileName}`, // ✅ CloudFront URL 반환
    };
  }
}
