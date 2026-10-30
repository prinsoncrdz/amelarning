'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RichTextEditor } from '@/components/RichTextEditor';
import { FileUpload } from '@/components/FileUpload';
import { ArrowLeft, Save, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function EditLessonPage() {
  const { id: courseId, lessonId } = useParams<{ id: string; lessonId: string }>();
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    moduleId: '',
    title: '',
    type: 'TEXT',
    order: '1'
  });

  const [textContent, setTextContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [quizPassingScore, setQuizPassingScore] = useState('70');
  const [quizTimeLimit, setQuizTimeLimit] = useState('10');

  useEffect(() => {
    if (!courseId || !lessonId) return;
    fetch('/api/admin/courses')
      .then(r => r.json())
      .then(data => {
        const foundCourse = (data.courses || []).find((c: any) => c.id === courseId);
        if (foundCourse) {
          setCourse(foundCourse);
          // Find target lesson inside course modules
          let foundLesson: any = null;
          for (const m of foundCourse.modules || []) {
            const match = m.lessons?.find((l: any) => l.id === lessonId);
            if (match) {
              foundLesson = match;
              break;
            }
          }
          if (foundLesson) {
            setLesson(foundLesson);
            setForm({
              moduleId: foundLesson.moduleId,
              title: foundLesson.title,
              type: foundLesson.type,
              order: String(foundLesson.order || 1)
            });

            // Fill content state
            const cnt = foundLesson.content || {};
            if (foundLesson.type === 'TEXT' || foundLesson.type === 'RICH_TEXT') {
              setTextContent(cnt.html || cnt.text || '');
            } else if (foundLesson.type === 'VIDEO') {
              setMediaUrl(cnt.videoUrl || '');
            } else if (foundLesson.type === 'IMAGE') {
              setMediaUrl(cnt.imageUrl || '');
            } else if (foundLesson.type === 'PDF') {
              setMediaUrl(cnt.pdfUrl || '');
            } else if (foundLesson.type === 'QUIZ') {
              if (foundLesson.quiz) {
                setQuizPassingScore(String(foundLesson.quiz.passingScore || 70));
                setQuizTimeLimit(String(foundLesson.quiz.timeLimitMinutes || 10));
              }
            }
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [courseId, lessonId]);

  const handleSave = async () => {
    if (!form.moduleId || !form.title.trim()) {
      alert('Please select a target module and enter a lesson title.');
      return;
    }

    setIsSaving(true);

    let content: any = {};
    if (form.type === 'TEXT' || form.type === 'RICH_TEXT') {
      content = { html: textContent, text: textContent.replace(/<[^>]*>?/gm, '') };
    } else if (form.type === 'VIDEO') {
      content = { videoUrl: mediaUrl };
    } else if (form.type === 'IMAGE') {
      content = { imageUrl: mediaUrl };
    } else if (form.type === 'PDF') {
      content = { pdfUrl: mediaUrl };
    } else if (form.type === 'QUIZ') {
      content = { passingScore: Number(quizPassingScore) || 70, timeLimitMinutes: Number(quizTimeLimit) || 10 };
    }

    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: form.moduleId,
          title: form.title,
          type: form.type,
          order: Number(form.order) || 1,
          content,
          quizPassingScore: Number(quizPassingScore) || 70,
          quizTimeLimit: Number(quizTimeLimit) || 10
        })
      });

      if (res.ok) {
        router.push(`/admin/courses/${courseId}/builder`);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update lesson.');
        setIsSaving(false);
      }
    } catch (err) {
      console.error(err);
      alert('Network error while updating lesson.');
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="page container">Loading lesson workspace...</div>;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
      {/* Dedicated Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid #e2e8f0', paddingBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: '#6366f1', textTransform: 'uppercase', marginBottom: 4 }}>
            DEDICATED FULL-WIDTH LESSON EDITOR PAGE
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Edit Lesson: {lesson?.title || 'Lesson Details'}
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Course: <strong>{course?.title || courseId}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Link href={`/admin/courses/${courseId}/builder`} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Course Builder
          </Link>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-primary"
            style={{ padding: '8px 20px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Save size={15} /> {isSaving ? 'Saving Changes...' : 'Save Lesson Changes'}
          </button>
        </div>
      </div>

      {/* Full-Width Workspace Card */}
      <div className="card" style={{ padding: 36, background: '#ffffff', borderRadius: 12 }}>
        <div className="form">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
            <div className="field">
              <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>TARGET MODULE *</label>
              <select
                required
                value={form.moduleId}
                onChange={e => setForm({ ...form, moduleId: e.target.value })}
              >
                <option value="">-- Select Module --</option>
                {course?.modules?.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    Module {m.order}: {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>LESSON TYPE</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
              >
                <option value="TEXT">Text / Rich Text (Word Canvas)</option>
                <option value="VIDEO">Video Lesson</option>
                <option value="IMAGE">Image Lesson</option>
                <option value="PDF">PDF Document</option>
                <option value="QUIZ">Quiz Assessment</option>
              </select>
            </div>

            <div className="field">
              <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>ORDER NUMBER</label>
              <input
                type="number"
                value={form.order}
                onChange={e => setForm({ ...form, order: e.target.value })}
              />
            </div>
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>LESSON TITLE *</label>
            <input
              required
              placeholder="e.g. Overview & Key Concepts"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* DEDICATED FULL-WIDTH WORD RICH TEXT EDITOR */}
          {(form.type === 'TEXT' || form.type === 'RICH_TEXT') && (
            <div className="field" style={{ marginTop: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span>LESSON CONTENT (WORD RICH TEXT EDITOR - FULL CANVAS) *</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#6366f1' }}>Microsoft Word Canvas View Active</span>
              </label>
              <RichTextEditor
                value={textContent}
                onChange={setTextContent}
                placeholder="Format lesson body, add headings, bold text, bullet points, quotes, links, or source code..."
              />
            </div>
          )}

          {/* MEDIA ASSET WORKSPACE */}
          {(form.type === 'VIDEO' || form.type === 'IMAGE' || form.type === 'PDF') && (
            <div style={{ marginTop: 16, padding: 24, background: '#f8fafc', borderRadius: 10, border: '1px solid #cbd5e1' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 16, color: '#0f172a', fontWeight: 700 }}>
                {form.type} Asset Configuration
              </h3>
              <div className="field">
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>{form.type} MEDIA URL</label>
                <input
                  placeholder={`Paste ${form.type} URL or upload file below...`}
                  value={mediaUrl}
                  onChange={e => setMediaUrl(e.target.value)}
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <FileUpload
                  label={`OR Upload ${form.type} File Directly to Cloudinary Storage`}
                  accept={form.type === 'VIDEO' ? 'video/*' : form.type === 'IMAGE' ? 'image/*' : 'application/pdf'}
                  placeholderUrl={mediaUrl}
                  onUploadSuccess={url => setMediaUrl(url)}
                />
              </div>
            </div>
          )}

          {/* QUIZ ASSESSMENT WORKSPACE */}
          {form.type === 'QUIZ' && (
            <div style={{ marginTop: 16, padding: 24, background: '#f8fafc', borderRadius: 10, border: '1px solid #cbd5e1' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 16, color: '#4f46e5', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <HelpCircle size={18} /> Quiz Assessment Configuration
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="field">
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>PASSING SCORE (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="70"
                    value={quizPassingScore}
                    onChange={e => setQuizPassingScore(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>TIME LIMIT (MINUTES)</label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    placeholder="10"
                    value={quizTimeLimit}
                    onChange={e => setQuizTimeLimit(e.target.value)}
                  />
                </div>
              </div>
              <p style={{ margin: '12px 0 0', fontSize: 12, color: '#64748b' }}>
                ℹ️ Standard passing threshold is 70%. You can manage questions on the course builder page after saving.
              </p>
            </div>
          )}

          {/* Save Action Footer */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
            <Link href={`/admin/courses/${courseId}/builder`} className="btn btn-outline" style={{ textDecoration: 'none' }}>
              Cancel
            </Link>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary"
              style={{ padding: '8px 20px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Save size={15} /> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
