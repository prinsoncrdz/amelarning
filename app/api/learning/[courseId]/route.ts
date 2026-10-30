import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { courseState } from '@/lib/learning';

export async function GET(_: Request, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const u = await requireUser();
    const { courseId } = await params;
    return NextResponse.json(await courseState(u.id, courseId));
  } catch (e: any) {
    if (e.message === 'NOT_ENROLLED') {
      return NextResponse.json(
        {
          error: 'NOT_ENROLLED',
          message: 'You are not enrolled in this course.',
          courseSlug: e.courseSlug,
          courseTitle: e.courseTitle
        },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: e.message === 'COURSE_NOT_FOUND' ? 'Course not found' : 'Unauthorized' },
      { status: e.message === 'COURSE_NOT_FOUND' ? 404 : 401 }
    );
  }
}
