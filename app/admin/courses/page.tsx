export const dynamic = 'force-dynamic';
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TableSkeleton } from '@/components/Skeleton';
import { Plus, Settings, AlertCircle, Info } from 'lucide-react';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [loading, setLoading] = useState(true);

  const loadCourses = () => {
    setLoading(true);
    fetch('/api/admin/courses')
      .then(r => r.json())
      .then(data => {
        setCourses(data.courses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'info' | 'error' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  async function toggleStatus(courseId: string, currentStatus: string) {
    const nextStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const res = await fetch('/api/admin/courses/' + courseId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    });
    if (res.ok) {
      loadCourses();
    } else {
      setAlertModal({
        isOpen: true,
        title: 'Update Failed',
        message: 'Could not update course status.',
        type: 'error'
      });
    }
  }

  const filteredCourses = courses.filter(c => {
    const matchesQuery = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="section-head">
        <div>
          <div className="eyebrow">COURSE CATALOG MANAGEMENT</div>
          <h1 style={{ fontSize: 32, letterSpacing: '-1.5px', margin: '4px 0 0' }}>
            Managed Courses
          </h1>
        </div>
        <Link href="/admin/courses/new" className="btn btn-primary" style={{ padding: '11px 20px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> Create New Course
        </Link>
      </div>

      {/* Filter Controls Bar */}
      <div className="card" style={{ padding: 20, marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search courses by title or slug..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 1, minWidth: 260, border: '1px solid var(--line)', borderRadius: 8, padding: '10px 14px', outline: 'none' }}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn ${statusFilter === st ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '7px 14px', fontSize: 12, borderRadius: 999 }}
            >
              {st === 'ALL' ? 'All Courses' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Table */}
      <div className="card" style={{ padding: 24 }}>
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : filteredCourses.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', background: '#fafafa', borderRadius: 10, border: '1px dashed var(--line)' }}>
            <p className="muted" style={{ margin: '0 0 16px', fontSize: 15 }}>
              No courses found matching your filter criteria.
            </p>
            <Link href="/admin/courses/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Plus size={16} /> Create First Course
            </Link>
          </div>
        ) : (
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                <th style={{ padding: 14 }}>Course Title & Slug</th>
                <th style={{ padding: 14 }}>Category</th>
                <th style={{ padding: 14 }}>Status</th>
                <th style={{ padding: 14 }}>Modules</th>
                <th style={{ padding: 14 }}>Enrollments</th>
                <th style={{ padding: 14, textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map(c => (
                <tr key={c.id}>
                  <td style={{ padding: 14 }}>
                    <b style={{ fontSize: 14 }}>{c.title}</b>
                    <div className="small muted" style={{ marginTop: 2 }}>{c.slug}</div>
                  </td>
                  <td style={{ padding: 14 }}>
                    <span className="tag" style={{ background: '#fff3eb', color: 'var(--orange)' }}>
                      {c.category?.name || 'Technology'}
                    </span>
                  </td>
                  <td style={{ padding: 14 }}>
                    <span
                      className="tag"
                      style={{
                        background: c.status === 'PUBLISHED' ? '#ecfdf3' : '#f2f4f7',
                        color: c.status === 'PUBLISHED' ? '#027a48' : '#344054'
                      }}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: 14 }}>{c._count?.modules || 0} Modules</td>
                  <td style={{ padding: 14 }}>{c._count?.enrollments || 0} Students</td>
                  <td style={{ padding: 14, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                      <Link
                        href={`/admin/courses/${c.id}/builder`}
                        className="btn btn-primary"
                        style={{ padding: '7px 14px', fontSize: 12, whiteSpace: 'nowrap', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <Settings size={14} /> Course Builder
                      </Link>
                      <button
                        onClick={() => toggleStatus(c.id, c.status)}
                        className="btn btn-outline"
                        style={{ padding: '7px 14px', fontSize: 12, whiteSpace: 'nowrap', borderRadius: 8, borderColor: '#d0d5dd', color: '#344054', background: '#fff' }}
                      >
                        {c.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Custom Alert Popup Modal */}
      {alertModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 300,
            padding: 20
          }}
        >
          <div
            className="card"
            style={{
              width: 420,
              padding: 28,
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              textAlign: 'center'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              {alertModal.type === 'error' ? <AlertCircle size={44} color="#ef4444" /> : <Info size={44} color="#3b82f6" />}
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, color: 'var(--ink)' }}>{alertModal.title}</h3>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#475467', lineHeight: 1.5 }}>
              {alertModal.message}
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '11px 16px', fontSize: 14 }}
              onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
            >
              OK, Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
