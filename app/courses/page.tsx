export const dynamic = 'force-dynamic';
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Tag, CreditCard, BookOpen, Clock, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';
import { CourseGridSkeleton } from '@/components/Skeleton';

export default function Courses() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('ALL');
  const [q, setQ] = useState('');
  const [priceFilter, setPriceFilter] = useState<'ALL' | 'FREE' | 'PAID'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(x => setCategories(x.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch('/api/courses?q=' + encodeURIComponent(q))
      .then(r => r.json())
      .then(x => {
        setCourses(x.courses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [q]);

  const filteredCourses = courses.filter(c => {
    const isFree = Number(c.price) === 0;
    const matchesPrice = priceFilter === 'ALL' || (priceFilter === 'FREE' ? isFree : !isFree);
    const matchesCategory = selectedCatId === 'ALL' || c.categoryId === selectedCatId || c.category?.id === selectedCatId;
    return matchesPrice && matchesCategory;
  });

  return (
    <main className="page" style={{ background: '#f8fafc', padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header Section */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: '#6366f1', textTransform: 'uppercase', marginBottom: 6 }}>
            COURSE CATALOG & STOREFRONT
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.8px' }}>
            Master Future-Ready Skills
          </h1>
          <p style={{ color: '#64748b', fontSize: 15, margin: 0 }}>
            Explore practical curriculums, interactive assessments, and verifiable certificates.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search" style={{ flex: 1, minWidth: 280, maxWidth: '100%', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search for courses, topics, or skills..."
              style={{ paddingLeft: 42, width: '100%', height: 44, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
            />
          </div>

          {/* Free vs Paid Quick Filter Tabs */}
          <div style={{ display: 'flex', gap: 6, background: '#e2e8f0', padding: 4, borderRadius: 8 }}>
            <button
              onClick={() => setPriceFilter('ALL')}
              style={{
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 6,
                border: 'none',
                background: priceFilter === 'ALL' ? '#ffffff' : 'transparent',
                color: priceFilter === 'ALL' ? '#0f172a' : '#64748b',
                cursor: 'pointer',
                boxShadow: priceFilter === 'ALL' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              All Courses ({courses.length})
            </button>
            <button
              onClick={() => setPriceFilter('FREE')}
              style={{
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 6,
                border: 'none',
                background: priceFilter === 'FREE' ? '#ffffff' : 'transparent',
                color: priceFilter === 'FREE' ? '#059669' : '#64748b',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: priceFilter === 'FREE' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <Tag size={14} style={{ color: '#059669' }} /> Free Courses
            </button>
            <button
              onClick={() => setPriceFilter('PAID')}
              style={{
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 6,
                border: 'none',
                background: priceFilter === 'PAID' ? '#ffffff' : 'transparent',
                color: priceFilter === 'PAID' ? '#4f46e5' : '#64748b',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: priceFilter === 'PAID' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <CreditCard size={14} style={{ color: '#4f46e5' }} /> Paid Courses
            </button>
          </div>
        </div>

        {/* Category Option Filter Bar (Multiple Options Available, Single Selection) */}
        <div className="horizontal-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 28, alignItems: 'center' }}>
          <button
            onClick={() => setSelectedCatId('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              border: selectedCatId === 'ALL' ? '2px solid #6366f1' : '1px solid #cbd5e1',
              background: selectedCatId === 'ALL' ? '#eef2ff' : '#ffffff',
              color: selectedCatId === 'ALL' ? '#4338ca' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            All Categories
          </button>
          {categories.map(c => {
            const isSelected = selectedCatId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCatId(c.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  border: isSelected ? '2px solid #6366f1' : '1px solid #cbd5e1',
                  background: isSelected ? '#eef2ff' : '#ffffff',
                  color: isSelected ? '#4338ca' : '#475569',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease'
                }}
              >
                <Tag size={13} style={{ color: isSelected ? '#4f46e5' : '#94a3b8' }} />
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>

        {/* Course Cards Grid */}
        {loading ? (
          <CourseGridSkeleton count={6} />
        ) : filteredCourses.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center', background: '#ffffff' }}>
            <BookOpen size={40} style={{ color: '#cbd5e1', marginBottom: 12 }} />
            <h3 style={{ margin: '0 0 6px', fontSize: 18, color: '#0f172a' }}>No courses match your criteria</h3>
            <p style={{ color: '#64748b', fontSize: 14 }}>Try adjusting your search query or price filter.</p>
          </div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {filteredCourses.map(c => {
              const isFree = Number(c.price) === 0;

              return (
                <div
                  key={c.id}
                  className="card"
                  onClick={() => router.push(`/courses/${c.slug}`)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    {/* Course Thumbnail Image with Price Badge Overlay */}
                    <div style={{ position: 'relative', height: 180, overflow: 'hidden', borderBottom: '1px solid #f1f5f9' }}>
                      <img
                        src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'}
                        alt={c.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {/* Price Badge Overlay */}
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
                              gap: 4,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
                              fontWeight: 800,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                            }}
                          >
                            ${c.price}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div style={{ padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
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
                        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                          {c.level}
                        </span>
                      </div>

                      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 8px', lineHeight: 1.35 }}>
                        {c.title}
                      </h3>

                      <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {c.shortDescription}
                      </p>

                      {/* Course Metadata (Duration & Modules) */}
                      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={14} style={{ color: '#94a3b8' }} /> {Math.round((c.durationMinutes || 0) / 60)} hrs
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Layers size={14} style={{ color: '#94a3b8' }} /> {c._count?.modules || 0} modules
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Explicit Purchase / Enroll Action Button */}
                  <div style={{ padding: '0 20px 20px 20px' }}>
                    {isFree ? (
                      <Link
                        href={`/courses/${c.slug}`}
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
                          gap: 6,
                          textDecoration: 'none'
                        }}
                      >
                        <CheckCircle2 size={15} /> Enroll Free <ArrowRight size={14} />
                      </Link>
                    ) : (
                      <Link
                        href={`/courses/${c.slug}`}
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
                          gap: 6,
                          textDecoration: 'none'
                        }}
                      >
                        <CreditCard size={15} /> Buy Now (${c.price}) <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
