import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ isConfigured: false });
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'elearning_lms';

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      apiSecret
    );

    return NextResponse.json({
      isConfigured: true,
      signature,
      timestamp,
      cloudName,
      apiKey,
      folder
    });
  } catch (error: any) {
    console.error('Signature error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate signature' }, { status: 500 });
  }
}
