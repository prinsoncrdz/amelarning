import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { uploadFileToStorage } from '@/lib/s3';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'application/octet-stream';

    let result: { url: string; storage: string; key: string };

    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      result = await uploadToCloudinary(buffer, file.name, mimeType);
    } else {
      result = await uploadFileToStorage(buffer, file.name, mimeType);
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      storage: result.storage,
      key: result.key,
      filename: file.name,
      size: file.size,
      mimeType: file.type
    });
  } catch (error: any) {
    console.error('File Upload Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
