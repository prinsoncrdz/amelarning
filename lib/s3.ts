import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

const bucketName = process.env.STORAGE_BUCKET_NAME || process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME;
const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.STORAGE_REGION || process.env.S3_REGION || process.env.AWS_REGION || 'ap-south-1';
const endpoint = process.env.STORAGE_ENDPOINT || process.env.S3_ENDPOINT || process.env.AWS_S3_ENDPOINT;
const publicUrlBase = process.env.STORAGE_PUBLIC_URL || process.env.S3_PUBLIC_URL || process.env.AWS_S3_PUBLIC_URL;

const isS3Configured = Boolean(bucketName && accessKeyId && secretAccessKey);

let s3Client: S3Client | null = null;

if (isS3Configured) {
  const config: any = {
    region,
    credentials: {
      accessKeyId: accessKeyId || '',
      secretAccessKey: secretAccessKey || '',
    },
  };

  if (endpoint) {
    config.endpoint = endpoint;
    config.forcePathStyle = true;
  }

  s3Client = new S3Client(config);
}

export async function uploadFileToStorage(
  buffer: Buffer,
  originalFilename: string,
  contentType: string
): Promise<{ url: string; storage: 's3' | 'local'; key: string }> {
  const fileExt = path.extname(originalFilename);
  const cleanName = path.basename(originalFilename, fileExt).replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniqueKey = `uploads/${Date.now()}-${cleanName}${fileExt}`;

  if (isS3Configured && s3Client && bucketName) {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueKey,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    let publicUrl = '';
    if (publicUrlBase) {
      const base = publicUrlBase.replace(/\/$/, '');
      publicUrl = `${base}/${uniqueKey}`;
    } else if (endpoint) {
      const ep = endpoint.replace(/\/$/, '');
      publicUrl = `${ep}/${bucketName}/${uniqueKey}`;
    } else {
      publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueKey}`;
    }

    return {
      url: publicUrl,
      storage: 's3',
      key: uniqueKey,
    };
  }

  // Fallback to local storage in public/uploads/ directory if S3 env variables are missing
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const localFilePath = path.join(uploadsDir, path.basename(uniqueKey));
  fs.writeFileSync(localFilePath, buffer);

  return {
    url: `/uploads/${path.basename(uniqueKey)}`,
    storage: 'local',
    key: uniqueKey,
  };
}
