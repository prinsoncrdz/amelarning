import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const b = schema.parse(body);

    const exists = await prisma.user.findUnique({
      where: { email: b.email.toLowerCase() }
    });

    if (exists) {
      return NextResponse.json({ error: 'Email is already registered. Please log in.' }, { status: 409 });
    }

    const u = await prisma.user.create({
      data: {
        firstName: b.firstName,
        lastName: b.lastName,
        email: b.email.toLowerCase(),
        passwordHash: await bcrypt.hash(b.password, 12),
        role: 'STUDENT',
        status: 'ACTIVE'
      }
    });

    const token = await signToken(u);
    const r = NextResponse.json({
      user: {
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role
      }
    });

    r.cookies.set('lms_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });

    return r;
  } catch (e: any) {
    console.error('Registration error:', e);
    if (e.name === 'ZodError') {
      return NextResponse.json({ error: e.errors[0]?.message || 'Invalid registration details' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Could not complete registration. Please try again.' }, { status: 400 });
  }
}
