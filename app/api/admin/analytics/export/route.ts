import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    if (user.role === 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get('type') || 'enrollments';

    if (reportType === 'courses') {
      const courses = await prisma.course.findMany({
        include: {
          instructor: { select: { firstName: true, lastName: true } },
          _count: { select: { enrollments: true, modules: true } }
        }
      });

      let csv = 'Course ID,Title,Status,Price,Level,Instructor,Modules Count,Enrollments Count\n';
      courses.forEach(c => {
        const title = `"${c.title.replace(/"/g, '""')}"`;
        const instructor = `"${c.instructor.firstName} ${c.instructor.lastName}"`;
        csv += `${c.id},${title},${c.status},${c.price},${c.level},${instructor},${c._count.modules},${c._count.enrollments}\n`;
      });

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="course_performance_report.csv"'
        }
      });
    }

    // Default: Enrollments Report
    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        course: { select: { title: true, price: true } }
      },
      orderBy: { startedAt: 'desc' }
    });

    let csv = 'Enrollment ID,Student Name,Email,Course Title,Price Paid,Progress %,Status,Enrolled Date\n';
    enrollments.forEach(e => {
      const studentName = `"${e.user.firstName} ${e.user.lastName}"`;
      const courseTitle = `"${e.course.title.replace(/"/g, '""')}"`;
      const date = new Date(e.startedAt).toISOString().split('T')[0];
      csv += `${e.id},${studentName},${e.user.email},${courseTitle},$${e.course.price},${e.progressPercentage}%,${e.status},${date}\n`;
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="student_enrollments_report.csv"'
      }
    });

  } catch (error) {
    console.error('Export Error:', error);
    return NextResponse.json({ error: 'Failed to export CSV report' }, { status: 500 });
  }
}
