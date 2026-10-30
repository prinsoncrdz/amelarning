export const dynamic = 'force-dynamic';
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileUpload } from '@/components/FileUpload';
import { AlertCircle, ArrowLeft, PlusCircle, Check, Tag, Loader2 } from 'lucide-react';

export default function NewCourse() {
  const router = useRouter();
  const [cats, setCats] = useState<any[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    description: '',
    thumbnail: '',
    level: 'Beginner',
    price: '0'
  });

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(x => {
        const list = x.categories || [];
        setCats(list);
        if (list.length > 0) {
          setSelectedCatId(list[0].id);
        }
      });
  }, []);

  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: ''
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCatId) {
      setAlertModal({
        isOpen: true,
        title: 'Category Required',
        message: 'Please select a category for your course.'
      });
      return;
    }

    setSubmitting(true);
    try {
      const r = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          categoryId: selectedCatId,
          categoryIds: [selectedCatId]
        })
      });
      const x = await r.json();
      if (r.ok) {
        router.push('/admin/courses/' + x.course.id + '/builder');
      } else {
        setSubmitting(false);
        setAlertModal({
          isOpen: true,
          title: 'Could Not Create Course',
          message: x.error || 'Failed to create course. Please try again.'
        });
      }
    } catch {
      setSubmitting(false);
      setAlertModal({
        isOpen: true,
        title: 'Error',
        message: 'Network error creating course. Please try again.'
      });
    }
  }

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: '#6366f1', textTransform: 'uppercase', marginBottom: 4 }}>
            DEDICATED COURSE AUTHORING PAGE
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
            Create New Course
          </h1>
        </div>
        <Link href="/admin" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </div>

      <div className="card" style={{ padding: 36, background: '#ffffff', borderRadius: 12 }}>
        <form className="form" onSubmit={submit}>
          <div className="field">
            <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>COURSE TITLE *</label>
            <input
              required
              placeholder="e.g. Advanced Prompt Engineering & AI Workflows"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="field">
            <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>SHORT DESCRIPTION *</label>
            <input
              required
              placeholder="A brief summary for course cards..."
              value={form.shortDescription}
              onChange={e => setForm({ ...form, shortDescription: e.target.value })}
            />
          </div>

          <div className="field">
            <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>DETAILED CURRICULUM DESCRIPTION</label>
            <textarea
              style={{ minHeight: 120 }}
              placeholder="Full curriculum description, target audience, learning outcomes..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* CATEGORY SELECTION DROPDOWN */}
          <div className="field" style={{ marginTop: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>SELECT COURSE CATEGORY *</label>
            <select
              required
              value={selectedCatId}
              onChange={e => setSelectedCatId(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                fontSize: 14,
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <option value="" disabled>Select a category...</option>
              {cats.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              Choose one primary category for your course from the dropdown menu.
            </p>
          </div>

          <div className="field" style={{ marginTop: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>THUMBNAIL IMAGE URL</label>
            <input
              placeholder="https://images.unsplash.com/..."
              value={form.thumbnail}
              onChange={e => setForm({ ...form, thumbnail: e.target.value })}
            />
            <FileUpload
              label="OR Upload Thumbnail File Directly to Cloudinary"
              accept="image/*"
              placeholderUrl={form.thumbnail}
              onUploadSuccess={url => setForm(f => ({ ...f, thumbnail: url }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field">
              <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>SKILL LEVEL</label>
              <select
                value={form.level}
                onChange={e => setForm({ ...form, level: e.target.value })}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div className="field">
              <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>PRICE ($)</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
              />
              <span style={{ fontSize: 11, color: Number(form.price) === 0 ? '#059669' : '#64748b', marginTop: 4, display: 'block', fontWeight: 600 }}>
                {Number(form.price) === 0 ? '✓ Configured as FREE Course ($0.00)' : `Paid Course ($${form.price}.00)`}
              </span>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ padding: '12px 24px', fontSize: 14, marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {submitting ? (
              <>
                <Loader2 size={16} className="spinner-icon" /> Creating Course...
              </>
            ) : (
              <>
                <PlusCircle size={16} /> Create Course & Open Module Builder
              </>
            )}
          </button>
        </form>
      </div>

      {/* Custom Alert Popup Modal */}
      {alertModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
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
              borderRadius: 12,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              textAlign: 'center'
            }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 99, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertCircle size={28} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{alertModal.title}</h3>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>
              {alertModal.message}
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '11px 16px', fontSize: 14, justifyContent: 'center' }}
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
