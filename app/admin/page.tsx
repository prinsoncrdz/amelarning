export const dynamic = 'force-dynamic';
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, PlusCircle, Users, ArrowRight } from 'lucide-react';

export default function AdminDashboardPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/courses')
      .then(r => r.json())
      .then(data => {
        setCourses(data.courses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalEnrollments = courses.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0);
  const publishedCourses = courses.filter(c => c.status === 'PUBLISHED').length;
  const draftCourses = courses.filter(c => c.status === 'DRAFT').length;

  return (
    <div>
      <div className="section-head">
        <div>
          <div className="eyebrow">ADMINISTRATION CONSOLE</div>
          <h1 style={{ fontSize: 28, letterSpacing: '-1px', margin: '4px 0 0' }}>
            System Dashboard Overview
          </h1>
        </div>
        <Link href="/admin/courses" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          Manage All Courses <ArrowRight size={14} />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, margin: '20px 0 30px' }}>
        <div className="card" style={{ padding: 20 }}>
          <b style={{ fontSize: 24, display: 'block', margin: '0 0 4px', color: 'var(--ink)' }}>{courses.length}</b>
          <div className="muted" style={{ fontSize: 12, fontWeight: 600 }}>Total Courses</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <b style={{ fontSize: 24, color: 'var(--green)', display: 'block', margin: '0 0 4px' }}>{publishedCourses}</b>
          <div className="muted" style={{ fontSize: 12, fontWeight: 600 }}>Published Courses</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <b style={{ fontSize: 24, color: 'var(--orange)', display: 'block', margin: '0 0 4px' }}>{draftCourses}</b>
          <div className="muted" style={{ fontSize: 12, fontWeight: 600 }}>Draft Courses</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <b style={{ fontSize: 24, display: 'block', margin: '0 0 4px', color: 'var(--ink)' }}>{totalEnrollments}</b>
          <div className="muted" style={{ fontSize: 12, fontWeight: 600 }}>Student Enrollments</div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 35 }}>
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#6366f1', marginBottom: 12 }}>
              <BookOpen size={28} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Courses Management</h3>
            <p className="muted" style={{ fontSize: 13, lineHeight: 1.6 }}>
              View, search, filter, publish, and build structured course curriculums with modules and lessons.
            </p>
          </div>
          <Link href="/admin/courses" className="btn btn-outline" style={{ marginTop: 20, width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Go to Courses <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#10b981', marginBottom: 12 }}>
              <PlusCircle size={28} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Author New Course</h3>
            <p className="muted" style={{ fontSize: 13, lineHeight: 1.6 }}>
              Create a new course, assign categories, set pricing, upload S3 cover thumbnails, and open the builder.
            </p>
          </div>
          <Link href="/admin/courses/new" className="btn btn-primary" style={{ marginTop: 20, width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <PlusCircle size={15} /> Create New Course
          </Link>
        </div>

        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#f59e0b', marginBottom: 12 }}>
              <Users size={28} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Student Analytics</h3>
            <p className="muted" style={{ fontSize: 13, lineHeight: 1.6 }}>
              Monitor student enrollments, completion rates, quiz retries, and automated certificate issuance.
            </p>
          </div>
          <Link href="/admin/students" className="btn btn-outline" style={{ marginTop: 20, width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            View Analytics <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Recent Courses Preview */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Recent Courses Summary</h3>
          <Link href="/admin/courses" className="small muted" style={{ textDecoration: 'underline' }}>View all courses</Link>
        </div>

        {loading ? (
          <p className="muted">Loading recent courses...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Status</th>
                <th>Modules</th>
                <th>Enrollments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.slice(0, 5).map(c => (
                <tr key={c.id}>
                  <td>
                    <b>{c.title}</b>
                    <div className="small muted">{c.slug}</div>
                  </td>
                  <td>
                    <span className="tag" style={{ background: c.status === 'PUBLISHED' ? '#ecfdf3' : '#f2f4f7', color: c.status === 'PUBLISHED' ? '#027a48' : '#344054' }}>
                      {c.status}
                    </span>
                  </td>
                  <td>{c._count?.modules || 0} Modules</td>
                  <td>{c._count?.enrollments || 0} Students</td>
                  <td>
                    <Link href={`/admin/courses/${c.id}/builder`} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 11 }}>
                      Open Builder
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
