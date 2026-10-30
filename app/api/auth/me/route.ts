import { NextResponse } from 'next/server'; import { getCurrentUser,safeUser } from '@/lib/auth';
export async function GET(){const u=await getCurrentUser();return NextResponse.json({user:u?safeUser(u):null});}
