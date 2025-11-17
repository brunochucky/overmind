
import { 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client, getBucketConfig } from './aws-config';

const s3Client = createS3Client();
const { bucketName, folderPrefix } = getBucketConfig();

/**
 * Upload a file to S3
 * @param buffer File buffer to upload
 * @param fileName Name for the file in S3
 * @returns The S3 key (cloud_storage_path)
 */
export async function uploadFile(buffer: Buffer, fileName: string): Promise<string> {
  const key = `${folderPrefix}${fileName}`;
  
  console.log('Uploading file to S3:', {
    bucket: bucketName,
    key,
    size: buffer.length,
  });

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: 'audio/webm',
  });

  await s3Client.send(command);
  console.log('File uploaded successfully to S3:', key);

  return key;
}

/**
 * Generate a signed URL for downloading a file from S3
 * @param key The S3 key (cloud_storage_path)
 * @param expiresIn Expiration time in seconds (default: 1 hour)
 * @returns Signed URL
 */
export async function getDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
}

/**
 * Delete a file from S3
 * @param key The S3 key (cloud_storage_path)
 */
export async function deleteFile(key: string): Promise<void> {
  console.log('Deleting file from S3:', key);

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await s3Client.send(command);
  console.log('File deleted successfully from S3:', key);
}

/**
 * Check if a file exists in S3
 * @param key The S3 key (cloud_storage_path)
 * @returns true if file exists
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    
    await s3Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
}
