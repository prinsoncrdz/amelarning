import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const rawParams = await props.params;
    const param = decodeURIComponent(rawParams.id || '').trim();
    const u = await getCurrentUser();

    if (!param) {
      return NextResponse.json({ error: 'Course identifier is required' }, { status: 400 });
    }

    // Support lookup by slug or by ID (case insensitive)
    const course = await prisma.course.findFirst({
      where: {
        OR: [
          { slug: { equals: param, mode: 'insensitive' } },
          { id: param }
        ]
      },
      include: {
        instructor: true,
        category: true,
        categories: true,
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    let enrollment = null;

    if (u) {
      enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: u.id,
            courseId: course.id
          }
        }
      });
    }

    return NextResponse.json({
      course: {
        ...course,
        price: Number(course.price),
        enrollment
      }
    });
  } catch (error: any) {
    console.error('Error fetching course detail:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
