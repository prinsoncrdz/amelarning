import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const u = await requireUser();
    if (u.role === 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const b = await req.json();

    const data: any = {};
    if (b.title !== undefined) data.title = b.title;
    if (b.description !== undefined) data.description = b.description;
    if (b.passingScore !== undefined) data.passingScore = Number(b.passingScore);
    if (b.timeLimitMinutes !== undefined) data.timeLimitMinutes = b.timeLimitMinutes ? Number(b.timeLimitMinutes) : null;

    const quiz = await prisma.quiz.update({
      where: { id },
      data
    });

    return NextResponse.json({ quiz });
  } catch (error) {
    return NextResponse.json({ error: 'Could not update quiz' }, { status: 400 });
  }
}
