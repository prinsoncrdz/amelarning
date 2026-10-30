import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const u = await requireUser();
    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId, status: 'PUBLISHED' }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const priceNum = Number(course.price) || 0;

    // Free course or 0 price -> auto enroll immediately
    if (priceNum === 0) {
      const enrollment = await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: u.id, courseId } },
        create: { userId: u.id, courseId, status: 'ENROLLED' },
        update: { lastAccessedAt: new Date() }
      });
      return NextResponse.json({ isFree: true, success: true, enrollment });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: u.id, courseId } }
    });

    if (existingEnrollment) {
      return NextResponse.json({ isFree: true, success: true, enrollment: existingEnrollment });
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_alphalearn_poc';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'test_secret_key_poc';

    const amountInPaise = Math.round(priceNum * 100);

    let orderId = `order_${courseId.slice(-6)}_${Date.now()}`;

    try {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret
      });

      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now().toString().slice(-8)}`,
        notes: {
          courseId,
          userId: u.id
        }
      });
      orderId = order.id;
    } catch (rzpErr: any) {
      console.warn('Razorpay API Order creation fallback to POC test order:', rzpErr?.message || rzpErr);
    }

    return NextResponse.json({
      success: true,
      isFree: false,
      orderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId,
      courseTitle: course.title,
      user: {
        name: `${u.firstName} ${u.lastName}`.trim(),
        email: u.email
      }
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: 'Unauthorized or failed to create order' }, { status: 401 });
  }
}
