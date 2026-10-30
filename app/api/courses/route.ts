import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category');

    const courses = await prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { shortDescription: { contains: q, mode: 'insensitive' } }
              ]
            }
          : {}),
        ...(category ? { category: { slug: category } } : {})
      },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        thumbnail: true,
        level: true,
        durationMinutes: true,
        price: true,
        isFeatured: true,
        createdAt: true,
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: { modules: true }
        }
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }]
    });

    const res = NextResponse.json({
      courses: courses.map(c => ({
        ...c,
        price: Number(c.price),
        instructorName: `${c.instructor.firstName} ${c.instructor.lastName}`
      }))
    });

    // Add Cache-Control for Edge acceleration
    res.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59');
    return res;
  } catch (error: any) {
    return NextResponse.json({ error: 'Could not fetch courses' }, { status: 500 });
  }
}
