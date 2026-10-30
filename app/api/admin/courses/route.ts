import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const u = await requireUser();
    if (u.role === 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const courses = await prisma.course.findMany({
      include: {
        category: true,
        categories: true,
        instructor: true,
        finalExam: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
              include: { options: true }
            }
          }
        },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              include: {
                quiz: {
                  include: {
                    questions: {
                      orderBy: { order: 'asc' },
                      include: { options: true }
                    }
                  }
                }
              }
            }
          }
        },
        _count: {
          select: { modules: true, enrollments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      courses: courses.map(c => ({
        ...c,
        price: Number(c.price)
      }))
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const u = await requireUser();
    if (u.role === 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const b = await req.json();
    const slug = String(b.slug || b.title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-');

    const catIds: string[] = Array.isArray(b.categoryIds) && b.categoryIds.length > 0
      ? b.categoryIds
      : b.categoryId
      ? [b.categoryId]
      : [];

    const primaryCatId = catIds[0] || b.categoryId;

    if (!primaryCatId) {
      return NextResponse.json({ error: 'At least one category is required' }, { status: 400 });
    }

    const c = await prisma.course.create({
      data: {
        title: b.title,
        slug,
        shortDescription: b.shortDescription || '',
        description: b.description || '',
        thumbnail: b.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
        instructorId: b.instructorId || u.id,
        categoryId: primaryCatId,
        categories: {
          connect: catIds.map(id => ({ id }))
        },
        level: b.level || 'Beginner',
        durationMinutes: Number(b.durationMinutes) || 0,
        price: Number(b.price) || 0,
        status: 'DRAFT'
      },
      include: {
        category: true,
        categories: true
      }
    });

    return NextResponse.json({ course: { ...c, price: Number(c.price) } }, { status: 201 });
  } catch (e) {
    console.error('Create course error:', e);
    return NextResponse.json({ error: 'Could not create course' }, { status: 400 });
  }
}
