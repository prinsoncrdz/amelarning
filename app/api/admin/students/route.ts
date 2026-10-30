import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const u = await requireUser();
    if (u.role === 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT'
      },
      include: {
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnail: true,
                price: true,
                level: true
              }
            }
          },
          orderBy: { lastAccessedAt: 'desc' }
        },
        certificates: {
          select: {
            id: true,
            certificateNumber: true,
            courseTitle: true,
            completionDate: true,
            verificationCode: true
          },
          orderBy: { completionDate: 'desc' }
        },
        quizAttempts: {
          include: {
            quiz: {
              select: {
                id: true,
                title: true
              }
            }
          },
          orderBy: { completedAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            enrollments: true,
            certificates: true,
            quizAttempts: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedStudents = students.map(s => {
      const activeCourses = s.enrollments.filter(e => e.status !== 'COMPLETED');
      const completedCourses = s.enrollments.filter(e => e.status === 'COMPLETED');

      return {
        id: s.id,
        name: `${s.firstName} ${s.lastName}`.trim(),
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        status: s.status,
        createdAt: s.createdAt,
        totalEnrollments: s.enrollments.length,
        activeCoursesCount: activeCourses.length,
        completedCoursesCount: completedCourses.length,
        certificatesCount: s.certificates.length,
        enrollments: s.enrollments.map(e => ({
          id: e.id,
          status: e.status,
          progressPercentage: Math.round(e.progressPercentage),
          startedAt: e.startedAt,
          completedAt: e.completedAt,
          lastAccessedAt: e.lastAccessedAt,
          course: {
            id: e.course.id,
            title: e.course.title,
            slug: e.course.slug,
            thumbnail: e.course.thumbnail,
            price: Number(e.course.price),
            level: e.course.level
          }
        })),
        certificates: s.certificates,
        quizAttempts: s.quizAttempts
      };
    });

    return NextResponse.json({ students: formattedStudents });
  } catch (error: any) {
    console.error('Error fetching admin students:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
