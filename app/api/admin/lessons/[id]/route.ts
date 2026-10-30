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
    const body = await req.json();

    const data: any = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.type !== undefined) data.type = body.type;
    if (body.order !== undefined) data.order = Number(body.order);
    if (body.content !== undefined) data.content = body.content;

    const lessonItem = await prisma.lesson.update({
      where: { id },
      data
    });

    return NextResponse.json({ lesson: lessonItem });
  } catch (error: any) {
    console.error('Update lesson error:', error);
    return NextResponse.json({ error: error?.message || 'Could not update lesson' }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const u = await requireUser();
    if (u.role === 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await prisma.lesson.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Could not delete lesson' }, { status: 400 });
  }
}
