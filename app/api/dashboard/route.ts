import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireUser();

    // Fetch user enrollments, total published courses, and certificates in parallel
    const [coursesCount, enrollments, certificates] = await Promise.all([
      prisma.course.count({ where: { status: 'PUBLISHED' } }),
      prisma.enrollment.findMany({
        where: { userId: user.id },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              thumbnail: true,
              slug: true
            }
          }
        },
        orderBy: { lastAccessedAt: 'desc' }
      }),
      prisma.certificate.findMany({
        where: { userId: user.id },
        orderBy: { completionDate: 'desc' }
      })
    ]);

    return NextResponse.json({
      user,
      coursesCount,
      enrollments: enrollments.map(e => ({
        id: e.id,
        status: e.status,
        progressPercentage: Math.round(e.progressPercentage || 0),
        lastAccessedAt: e.lastAccessedAt,
        course: {
          id: e.course.id,
          title: e.course.title,
          thumbnail: e.course.thumbnail,
          slug: e.course.slug
        }
      })),
      certificates
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
