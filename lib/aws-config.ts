
import { S3Client } from '@aws-sdk/client-s3';

/**
 * Get bucket configuration from environment variables
 */
export function getBucketConfig() {
  const bucketName = process.env.AWS_BUCKET_NAME;
  const folderPrefix = process.env.AWS_FOLDER_PREFIX || '';

  if (!bucketName) {
    throw new Error('AWS_BUCKET_NAME environment variable is not set');
  }

  return {
    bucketName,
    folderPrefix,
  };
}

/**
 * Create S3 client with AWS credentials from environment
 */
export function createS3Client(): S3Client {
  return new S3Client({});
}
