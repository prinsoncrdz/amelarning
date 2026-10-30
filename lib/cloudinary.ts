import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function uploadToCloudinary(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<{ url: string; storage: 'cloudinary' | 'local'; key: string }> {
  const fileExt = path.extname(originalFilename);
  const cleanName = path.basename(originalFilename, fileExt).replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniqueKey = `lms_uploads/${Date.now()}_${cleanName}`;

  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const resourceType = mimeType.startsWith('video/')
        ? 'video'
        : mimeType.startsWith('image/')
        ? 'image'
        : 'raw';

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'elearning_lms',
          public_id: `${Date.now()}_${cleanName}`,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result?.secure_url || result?.url || '',
            storage: 'cloudinary',
            key: result?.public_id || uniqueKey,
          });
        }
      );

      uploadStream.end(buffer);
    });
  }

  // Fallback to local storage in public/uploads/ if Cloudinary credentials are missing
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const localFileName = `${Date.now()}_${cleanName}${fileExt}`;
  const localFilePath = path.join(uploadsDir, localFileName);
  fs.writeFileSync(localFilePath, buffer);

  return {
    url: `/uploads/${localFileName}`,
    storage: 'local',
    key: localFileName,
  };
}
