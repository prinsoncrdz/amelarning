import { NextResponse } from 'next/server'; import crypto from 'node:crypto'; import { requireUser } from '@/lib/auth'; import { prisma } from '@/lib/prisma';
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){try{const u=await requireUser();const {id}=await params;const body=await req.json();const quiz=await prisma.quiz.findUnique({where:{id},include:{questions:{include:{options:true},orderBy:{order:'asc'}},lesson:{include:{module:true}},courseFinalFor:true}});if(!quiz)return NextResponse.json({error:'Quiz not found'},{status:404});const prior=await prisma.quizAttempt.count({where:{userId:u.id,quizId:id}});let points=0,total=0;const answers=Array.isArray(body.answers)?body.answers:[];const answerRows=[];for(const q of quiz.questions){total+=q.points;const given=(answers.find((a:any)=>a.questionId===q.id)?.selectedOptionIds||[]).sort();const correct=q.options.filter(o=>o.isCorrect).map(o=>o.id).sort();const ok=JSON.stringify(given)===JSON.stringify(correct);if(ok)points+=q.points;answerRows.push({questionId:q.id,selectedOptionIds:given,isCorrect:ok});}const percentage=total?Math.round(points/total*100):0;const passed=percentage>=quiz.passingScore;const attempt=await prisma.quizAttempt.create({data:{userId:u.id,quizId:id,attemptNumber:prior+1,score:points,percentage,passed,answers:{create:answerRows}}});const targetLessonId=quiz.lessonId||quiz.lesson?.id;if(passed&&targetLessonId){await prisma.lessonProgress.upsert({where:{userId_lessonId:{userId:u.id,lessonId:targetLessonId}},create:{userId:u.id,lessonId:targetLessonId,status:'COMPLETED',progressPercentage:100,completedAt:new Date()},update:{status:'COMPLETED',progressPercentage:100,completedAt:new Date()}})}let certificate=null;
if(passed && quiz.courseFinalFor){
 const course=await prisma.course.findUnique({where:{id:quiz.courseFinalFor.id},include:{modules:{include:{lessons:{where:{isRequired:true}}}},instructor:true}});
 if(course){
  const required=course.modules.filter(m=>m.isRequired);
  const ids=required.flatMap(m=>m.lessons.map(l=>l.id));
  const done=await prisma.lessonProgress.count({where:{userId:u.id,lessonId:{in:ids},status:'COMPLETED'}});
  if(done===ids.length){
   await prisma.enrollment.update({where:{userId_courseId:{userId:u.id,courseId:course.id}},data:{status:'COMPLETED',progressPercentage:100,completedAt:new Date()}});
   const existing=await prisma.certificate.findFirst({where:{userId:u.id,courseId:course.id}});
   certificate=existing||await prisma.certificate.create({data:{certificateNumber:`CERT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,verificationCode:crypto.randomUUID(),userId:u.id,courseId:course.id,studentName:`${u.firstName} ${u.lastName}`,courseTitle:course.title,completionDate:new Date(),instructorName:`${course.instructor.firstName} ${course.instructor.lastName}`}});
  }
 }
}
return NextResponse.json({attempt,score:points,percentage,passed,passingScore:quiz.passingScore,courseCompleted:!!certificate,certificate});}catch(e:any){return NextResponse.json({error:'Could not submit quiz'},{status:400})}}
