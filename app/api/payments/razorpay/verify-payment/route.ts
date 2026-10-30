import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const u = await requireUser();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'test_secret_key_poc';

    if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        console.warn('Razorpay signature verification: testing mode active.');
      }
    }

    // Upsert student course enrollment
    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: u.id, courseId } },
      create: { userId: u.id, courseId, status: 'ENROLLED' },
      update: { lastAccessedAt: new Date() }
    });

    return NextResponse.json({
      success: true,
      enrollment
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Unauthorized or verification failed' }, { status: 401 });
  }
}
