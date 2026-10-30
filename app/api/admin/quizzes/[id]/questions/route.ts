import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const u = await requireUser();
    if (u.role === 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const b = await req.json();

    // Calculate next order number
    const count = await prisma.quizQuestion.count({ where: { quizId: id } });

    const question = await prisma.quizQuestion.create({
      data: {
        quizId: id,
        question: b.question,
        type: b.type || 'SINGLE_CHOICE',
        points: Number(b.points) || 1,
        order: count + 1,
        options: {
          create: (b.options || []).map((o: any) => ({
            text: o.text,
            isCorrect: Boolean(o.isCorrect)
          }))
        }
      },
      include: { options: true }
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding quiz question:', error);
    return NextResponse.json({ error: 'Could not add question' }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const u = await requireUser();
    if (u.role === 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(req.url);
    const questionId = url.searchParams.get('questionId');

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID required' }, { status: 400 });
    }

    await prisma.quizQuestion.delete({ where: { id: questionId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Could not delete question' }, { status: 400 });
  }
}
