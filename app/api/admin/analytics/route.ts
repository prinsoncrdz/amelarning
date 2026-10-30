import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireUser();
    if (user.role === 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [
      totalStudents,
      totalInstructors,
      totalCourses,
      publishedCourses,
      enrollments,
      quizAttempts,
      certificatesCount,
      courses
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: { in: ['INSTRUCTOR', 'ADMIN'] } } }),
      prisma.course.count(),
      prisma.course.count({ where: { status: 'PUBLISHED' } }),
      prisma.enrollment.findMany({
        include: {
          course: true,
          user: { select: { firstName: true, lastName: true, email: true } }
        },
        orderBy: { startedAt: 'desc' }
      }),
      prisma.quizAttempt.findMany(),
      prisma.certificate.count(),
      prisma.course.findMany({
        include: {
          _count: { select: { enrollments: true, modules: true } },
          category: true,
          categories: true
        }
      })
    ]);

    const totalEnrollments = enrollments.length;
    const completedEnrollments = enrollments.filter(e => e.status === 'COMPLETED').length;
    const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

    // Revenue calculation
    const totalRevenue = enrollments.reduce((sum, e) => sum + (Number(e.course.price) || 0), 0);

    // Quiz Stats
    const quizAttemptsCount = quizAttempts.length;
    const quizPassCount = quizAttempts.filter(q => q.passed).length;
    const quizPassRate = quizAttemptsCount > 0 ? Math.round((quizPassCount / quizAttemptsCount) * 100) : 0;
    const avgQuizScore = quizAttemptsCount > 0
      ? Math.round(quizAttempts.reduce((sum, q) => sum + q.percentage, 0) / quizAttemptsCount)
      : 0;

    // Course specific breakdown
    const coursePerformance = courses.map(c => {
      const courseEnrollments = enrollments.filter(e => e.courseId === c.id);
      const courseCompleted = courseEnrollments.filter(e => e.status === 'COMPLETED').length;
      const courseRevenue = courseEnrollments.length * Number(c.price);

      return {
        id: c.id,
        title: c.title,
        slug: c.slug,
        price: Number(c.price),
        status: c.status,
        enrollmentsCount: courseEnrollments.length,
        completedCount: courseCompleted,
        completionRate: courseEnrollments.length > 0 ? Math.round((courseCompleted / courseEnrollments.length) * 100) : 0,
        revenue: courseRevenue
      };
    }).sort((a, b) => b.enrollmentsCount - a.enrollmentsCount);

    // Recent activity
    const recentEnrollments = enrollments.slice(0, 8).map(e => ({
      id: e.id,
      studentName: `${e.user.firstName} ${e.user.lastName}`,
      studentEmail: e.user.email,
      courseTitle: e.course.title,
      price: Number(e.course.price),
      status: e.status,
      progressPercentage: e.progressPercentage,
      startedAt: e.startedAt
    }));

    return NextResponse.json({
      metrics: {
        totalStudents,
        totalInstructors,
        totalCourses,
        publishedCourses,
        totalEnrollments,
        completedEnrollments,
        completionRate,
        totalRevenue,
        quizAttemptsCount,
        quizPassCount,
        quizPassRate,
        avgQuizScore,
        certificatesCount
      },
      coursePerformance,
      recentEnrollments
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
  }
}
