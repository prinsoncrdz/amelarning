import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import { prisma } from './prisma';
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret-change-me');
export async function signToken(user:{id:string;role:string}) { return new SignJWT({role:user.role}).setProtectedHeader({alg:'HS256'}).setSubject(user.id).setIssuedAt().setExpirationTime('7d').sign(secret); }
export async function getCurrentUser(){ const token=(await cookies()).get('lms_session')?.value; if(!token)return null; try{const {payload}=await jwtVerify(token,secret); if(!payload.sub)return null; return prisma.user.findUnique({where:{id:payload.sub}})}catch{return null} }
export async function requireUser(){const u=await getCurrentUser(); if(!u) throw new Error('UNAUTHORIZED'); return u;}
export function safeUser(u:any){return {id:u.id,firstName:u.firstName,lastName:u.lastName,email:u.email,role:u.role,profileImage:u.profileImage};}
