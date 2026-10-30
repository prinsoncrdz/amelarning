import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const u = await requireUser();
    if (u.role === 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await props.params;
    const b = await req.json();
    const data: any = {};

    if (b.title !== undefined) data.title = b.title;
    if (b.shortDescription !== undefined) data.shortDescription = b.shortDescription;
    if (b.description !== undefined) data.description = b.description;
    if (b.thumbnail !== undefined) data.thumbnail = b.thumbnail;
    if (b.level !== undefined) data.level = b.level;
    if (b.price !== undefined) data.price = Number(b.price);
    if (b.durationMinutes !== undefined) data.durationMinutes = Number(b.durationMinutes);

    if (b.status !== undefined) {
      data.status = b.status;
      data.publishedAt = b.status === 'PUBLISHED' ? new Date() : null;
    }

    if (b.finalExamEnabled !== undefined) data.finalExamEnabled = Boolean(b.finalExamEnabled);
    if (b.finalPassingScore !== undefined) data.finalPassingScore = Number(b.finalPassingScore);
    if (b.maxExamAttempts !== undefined) data.maxExamAttempts = b.maxExamAttempts ? Number(b.maxExamAttempts) : null;

    // Auto-create final exam quiz if enabled and not already assigned
    if (b.finalExamEnabled && !b.finalExamId) {
      const existingCourse = await prisma.course.findUnique({ where: { id }, select: { finalExamId: true, title: true } });
      if (!existingCourse?.finalExamId) {
        const newQuiz = await prisma.quiz.create({
          data: {
            title: `Final Assessment: ${existingCourse?.title || 'Course Exam'}`,
            description: 'Comprehensive final examination required for course completion and certificate issuance.',
            passingScore: Number(b.finalPassingScore) || 70,
            maxAttempts: b.maxExamAttempts ? Number(b.maxExamAttempts) : null,
            timeLimitMinutes: 30
          }
        });
        data.finalExamId = newQuiz.id;
      }
    }

    if (Array.isArray(b.categoryIds) && b.categoryIds.length > 0) {
      data.categoryId = b.categoryIds[0];
      data.categories = {
        set: b.categoryIds.map((catId: string) => ({ id: catId }))
      };
    } else if (b.categoryId) {
      data.categoryId = b.categoryId;
      data.categories = {
        set: [{ id: b.categoryId }]
      };
    }

    const c = await prisma.course.update({
      where: { id },
      data,
      include: {
        category: true,
        categories: true
      }
    });

    return NextResponse.json({ course: { ...c, price: Number(c.price) } });
  } catch (err) {
    console.error('Update course error:', err);
    return NextResponse.json({ error: 'Could not update course' }, { status: 400 });
  }
}
