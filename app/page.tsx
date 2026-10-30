import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import { Search, Tag, CreditCard, ArrowRight, BookOpen, CheckCircle2, ShieldCheck, Award } from 'lucide-react';

const hero = 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80';

export default async function Home() {
  const featuredCourses = await prisma.course.findMany({
    where: { status: 'PUBLISHED' },
    take: 6,
    include: {
      category: true,
      _count: {
        select: { modules: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-copy">
          <div className="eyebrow" style={{ color: '#6366f1' }}>PROFESSIONAL LEARNING PLATFORM</div>
          <h1 style={{ fontSize: 44, fontWeight: 800, color: '#0f172a' }}>
            Learn Today<br />
            <span style={{ color: '#4f46e5' }}>Build Tomorrow</span>
          </h1>
          <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.6 }}>
            Master skills for a smarter, tech-driven world. Learn from industry experts and advance your career with practical, backend-managed courses.
          </p>
          <form className="search" action="/courses">
            <input name="q" placeholder="Search for courses, skills or topics..." />
            <button className="btn btn-primary" type="submit">
              Search
            </button>
          </form>
        </div>
        <div className="hero-art">
          <img src={hero} alt="Learner" />
        </div>
      </section>

      {/* Platform Stat Bar */}
      <div className="container">
        <div className="stats" style={{ margin: '30px 0 50px' }}>
          <div className="stat">
            <b style={{ fontSize: 26, color: '#0f172a' }}>1,000+</b>
            <span>Courses & lessons</span>
          </div>
          <div className="stat">
            <b style={{ fontSize: 26, color: '#0f172a' }}>50+</b>
            <span>Industry experts</span>
          </div>
          <div className="stat">
            <b style={{ fontSize: 26, color: '#10b981' }}>100%</b>
            <span>Verifiable Certificates</span>
          </div>
          <div className="stat">
            <b style={{ fontSize: 26, color: '#4f46e5' }}>24/7</b>
            <span>Adaptive Learning</span>
          </div>
        </div>
      </div>

      {/* Featured Courses Showcase Section with Purchase / Enroll Buttons */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head" style={{ marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: '#6366f1', textTransform: 'uppercase', marginBottom: 4 }}>
                FEATURED CURRICULUMS
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
                Featured Courses
              </h2>
            </div>
            <Link href="/courses" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
              Explore All Courses <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {featuredCourses.map(c => {
              const isFree = Number(c.price) === 0;

              return (
                <Link
                  key={c.id}
                  href={`/courses/${c.slug}`}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    textDecoration: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    {/* Thumbnail & Price Tag */}
                    <div style={{ position: 'relative', height: 180, overflow: 'hidden', borderBottom: '1px solid #f1f5f9' }}>
                      <img
                        src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'}
                        alt={c.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
                        {isFree ? (
                          <span
                            style={{
                              background: '#ecfdf5',
                              color: '#047857',
                              border: '1px solid #a7f3d0',
                              padding: '4px 10px',
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <Tag size={13} /> FREE
                          </span>
                        ) : (
                          <span
                            style={{
                              background: '#0f172a',
                              color: '#ffffff',
                              padding: '4px 12px',
                              borderRadius: 20,
                              fontSize: 13,
                              fontWeight: 800
                            }}
                          >
                            ${Number(c.price)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Information */}
                    <div style={{ padding: 20 }}>
                      <span
                        style={{
                          background: '#e0e7ff',
                          color: '#4338ca',
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 4,
                          textTransform: 'uppercase'
                        }}
                      >
                        {c.category?.name || 'General'}
                      </span>

                      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '10px 0 8px', lineHeight: 1.35 }}>
                        {c.title}
                      </h3>

                      <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {c.shortDescription}
                      </p>
                    </div>
                  </div>

                  {/* Explicit Purchase / Enroll Button Visual */}
                  <div style={{ padding: '0 20px 20px 20px' }}>
                    {isFree ? (
                      <span
                        className="btn"
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          fontSize: 13,
                          fontWeight: 700,
                          background: '#ecfdf5',
                          color: '#047857',
                          border: '1px solid #a7f3d0',
                          borderRadius: 8,
                          justifyContent: 'center',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <CheckCircle2 size={15} /> Enroll Free <ArrowRight size={14} />
                      </span>
                    ) : (
                      <span
                        className="btn btn-primary"
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          fontSize: 13,
                          fontWeight: 700,
                          borderRadius: 8,
                          justifyContent: 'center',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <CreditCard size={15} /> Buy Now (${Number(c.price)}) <ArrowRight size={14} />
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="section" style={{ paddingTop: 10 }}>
        <div className="container">
          <div className="card" style={{ padding: 40, background: '#0f172a', color: '#fff', borderRadius: 16, textAlign: 'center' }}>
            <div className="eyebrow" style={{ color: '#6366f1' }}>START LEARNING TODAY</div>
            <h2 style={{ fontSize: 32, margin: '10px 0 14px', color: '#fff' }}>
              Unlock your potential with structured learning.
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: 650, margin: '0 auto 24px', fontSize: 15 }}>
              Access video, text, interactive assessment modules, progress tracking, and verifiable certificates.
            </p>
            <Link className="btn btn-primary" href="/courses" style={{ padding: '12px 24px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
              Explore All Courses <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
