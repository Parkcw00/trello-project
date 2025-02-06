import { config } from 'dotenv';
config(); // .env 파일 로드

export const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  bucketName: process.env.AWS_S3_BUCKET,
  cloudFrontUrl: process.env.AWS_CLOUDFRONT_URL,
};
