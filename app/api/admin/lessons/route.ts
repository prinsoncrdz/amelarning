import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const u = await requireUser();
    if (u.role === 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const b = await req.json();
    if (!b.moduleId || !b.title) {
      return NextResponse.json({ error: 'Module ID and Lesson Title are required.' }, { status: 400 });
    }

    let content = b.content || {};
    const passingScoreNum = Number(b.passingScore || b.quizPassingScore) || 70;
    const timeLimitNum = Number(b.timeLimitMinutes || b.quizTimeLimit) || 10;

    let createdQuizId: string | null = null;

    if (b.type === 'QUIZ' && !content.quizId) {
      const quiz = await prisma.quiz.create({
        data: {
          title: `${b.title} Assessment`,
          description: `Knowledge check for ${b.title}`,
          passingScore: passingScoreNum,
          timeLimitMinutes: timeLimitNum
        }
      });
      createdQuizId = quiz.id;
      content = { ...content, quizId: quiz.id };
    }

    // Determine target order to avoid unique constraint collisions
    let reqOrder = Number(b.order);
    if (!reqOrder || isNaN(reqOrder)) {
      const lastLesson = await prisma.lesson.findFirst({
        where: { moduleId: b.moduleId },
        orderBy: { order: 'desc' },
        select: { order: true }
      });
      reqOrder = (lastLesson?.order || 0) + 1;
    } else {
      const existingWithOrder = await prisma.lesson.findUnique({
        where: {
          moduleId_order: {
            moduleId: b.moduleId,
            order: reqOrder
          }
        }
      });
      if (existingWithOrder) {
        const lastLesson = await prisma.lesson.findFirst({
          where: { moduleId: b.moduleId },
          orderBy: { order: 'desc' },
          select: { order: true }
        });
        reqOrder = (lastLesson?.order || 0) + 1;
      }
    }

    const lessonData: any = {
      moduleId: b.moduleId,
      title: b.title,
      type: b.type || 'TEXT',
      order: reqOrder,
      durationMinutes: Number(b.durationMinutes) || 0,
      completionRule: b.type === 'QUIZ' ? 'QUIZ_PASS' : b.completionRule || 'MANUAL',
      completionThreshold: passingScoreNum,
      content
    };

    if (createdQuizId) {
      lessonData.quiz = { connect: { id: createdQuizId } };
    } else if (content.quizId) {
      lessonData.quiz = { connect: { id: content.quizId } };
    }

    const l = await prisma.lesson.create({ data: lessonData });

    return NextResponse.json({ lesson: l }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating lesson:', error);
    return NextResponse.json({ error: error?.message || 'Could not create lesson' }, { status: 400 });
  }
}
