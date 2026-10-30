import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const defaults = [
      { name: 'Artificial Intelligence & ML', slug: 'ai-ml', description: 'AI, Deep Learning & Prompt Engineering' },
      { name: 'Web & Fullstack Development', slug: 'web-development', description: 'Frontend, Backend & Modern Web Tech' },
      { name: 'Data Science & Analytics', slug: 'data-science', description: 'Data Analytics, SQL & Python' },
      { name: 'DevOps & Cloud Computing', slug: 'devops-cloud', description: 'AWS, Docker, Kubernetes & Cloud' },
      { name: 'Cybersecurity & InfoSec', slug: 'cybersecurity', description: 'Ethical Hacking & Network Security' },
      { name: 'UI/UX & Product Design', slug: 'design', description: 'Figma, Design Systems & User Experience' },
      { name: 'Business & Management', slug: 'business', description: 'Management, Leadership & Marketing' }
    ];

    for (const cat of defaults) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, description: cat.description },
        create: cat
      });
    }

    const categories = await prisma.category.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
